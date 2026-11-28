-- Simulações gravadas para comparação (aba Seleção da Simulação e grupo
-- "Comparações entre simulações" em /ssd/cenarios).
--
--   simulacoes            : uma por gravação, de cada usuário (título obrigatório),
--                           com cópia dos parâmetros usados e a série mensal agregada
--   simulacao_modelos     : modelos que participaram (id + cópia de fonte/cenários/estratégias)
--   simulacao_resultados  : indicadores calculados (um registro por indicador e fonte)
--   matriz_decisao_config : sentido e peso de cada indicador na matriz de decisão (geral)
--   simulacao_usuario     : escolhas próprias de cada usuário (cenários de demanda,
--                           consumo e perdas; período) — não afetam os demais usuários
-- Também: taxa de desconto (geral) e data da última importação de cada modelo.

ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS taxa_desconto DOUBLE PRECISION DEFAULT 0;
ALTER TABLE public.modelos ADD COLUMN IF NOT EXISTS importado_em TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.simulacao_usuario (
    id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    id_cd INTEGER REFERENCES public.cenario_demanda(id_cd) ON DELETE SET NULL,
    id_cc INTEGER REFERENCES public.cenario_consumo(id_cc) ON DELETE SET NULL,
    id_cp INTEGER REFERENCES public.cenario_perdas(id_cp) ON DELETE SET NULL,
    ano_inicio INTEGER,
    ano_fim INTEGER,
    atualizado_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.simulacoes (
    id_simulacao SERIAL PRIMARY KEY,
    id_usuario UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR NOT NULL CHECK (btrim(titulo) <> ''),
    descricao TEXT,
    comparar BOOLEAN NOT NULL DEFAULT false,
    parametros JSONB NOT NULL DEFAULT '{}'::jsonb,
    serie_mensal JSONB NOT NULL DEFAULT '[]'::jsonb,
    criado_at TIMESTAMPTZ DEFAULT NOW(),
    gravado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_simulacoes_usuario ON public.simulacoes(id_usuario);

CREATE TABLE IF NOT EXISTS public.simulacao_modelos (
    id SERIAL PRIMARY KEY,
    id_simulacao INTEGER NOT NULL REFERENCES public.simulacoes(id_simulacao) ON DELETE CASCADE,
    id_mod INTEGER REFERENCES public.modelos(id_mod) ON DELETE SET NULL, -- nulo = modelo excluído
    id_mod_original INTEGER NOT NULL,
    id_fonte INTEGER,
    nome_fonte VARCHAR,
    cenarios JSONB NOT NULL DEFAULT '[]'::jsonb,
    estrategias JSONB NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_simulacao_modelos_sim ON public.simulacao_modelos(id_simulacao);

CREATE TABLE IF NOT EXISTS public.simulacao_resultados (
    id SERIAL PRIMARY KEY,
    id_simulacao INTEGER NOT NULL REFERENCES public.simulacoes(id_simulacao) ON DELETE CASCADE,
    indicador VARCHAR NOT NULL,
    id_fonte INTEGER, -- preenchido nos indicadores por fonte (ex.: participação)
    valor DOUBLE PRECISION
);
CREATE INDEX IF NOT EXISTS idx_simulacao_resultados_sim ON public.simulacao_resultados(id_simulacao);

CREATE TABLE IF NOT EXISTS public.matriz_decisao_config (
    indicador VARCHAR PRIMARY KEY,
    incluir BOOLEAN NOT NULL DEFAULT true,
    sentido VARCHAR NOT NULL CHECK (sentido IN ('maior', 'menor')),
    peso DOUBLE PRECISION NOT NULL DEFAULT 1 CHECK (peso >= 0),
    atualizado_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.matriz_decisao_config (indicador, incluir, sentido, peso) VALUES
  ('vazao_media_distribuida', true,  'maior', 1),
  ('demanda_media',           false, 'menor', 1),
  ('meses_deficit',           true,  'menor', 1),
  ('indice_medio',            true,  'maior', 1),
  ('indice_minimo',           true,  'maior', 1),
  ('pct_meses_seguro',        false, 'maior', 1),
  ('pct_meses_colapso',       true,  'menor', 1),
  ('deficit_acumulado',       true,  'menor', 1),
  ('maior_sequencia_deficit', false, 'menor', 1),
  ('capex_total',             true,  'menor', 1),
  ('opex_total',              true,  'menor', 1),
  ('custo_m3',                true,  'menor', 1),
  ('vpl_custos',              true,  'menor', 1)
ON CONFLICT (indicador) DO NOTHING;

-- Permissões: simulações e escolhas são visíveis e alteráveis só pelo dono;
-- a configuração da matriz é geral (leitura pública, escrita autenticada).
ALTER TABLE public.simulacao_usuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dono_simulacao_usuario" ON public.simulacao_usuario;
CREATE POLICY "dono_simulacao_usuario" ON public.simulacao_usuario FOR ALL TO authenticated
  USING (id_usuario = auth.uid()) WITH CHECK (id_usuario = auth.uid());

ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dono_simulacoes" ON public.simulacoes;
CREATE POLICY "dono_simulacoes" ON public.simulacoes FOR ALL TO authenticated
  USING (id_usuario = auth.uid()) WITH CHECK (id_usuario = auth.uid());

ALTER TABLE public.simulacao_modelos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dono_simulacao_modelos" ON public.simulacao_modelos;
CREATE POLICY "dono_simulacao_modelos" ON public.simulacao_modelos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.simulacoes s WHERE s.id_simulacao = simulacao_modelos.id_simulacao AND s.id_usuario = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.simulacoes s WHERE s.id_simulacao = simulacao_modelos.id_simulacao AND s.id_usuario = auth.uid()));

ALTER TABLE public.simulacao_resultados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dono_simulacao_resultados" ON public.simulacao_resultados;
CREATE POLICY "dono_simulacao_resultados" ON public.simulacao_resultados FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.simulacoes s WHERE s.id_simulacao = simulacao_resultados.id_simulacao AND s.id_usuario = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.simulacoes s WHERE s.id_simulacao = simulacao_resultados.id_simulacao AND s.id_usuario = auth.uid()));

ALTER TABLE public.matriz_decisao_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_matriz_decisao_config" ON public.matriz_decisao_config;
CREATE POLICY "anon_read_matriz_decisao_config" ON public.matriz_decisao_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_all_matriz_decisao_config" ON public.matriz_decisao_config;
CREATE POLICY "auth_all_matriz_decisao_config" ON public.matriz_decisao_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.simulacao_usuario, public.simulacoes, public.simulacao_modelos,
  public.simulacao_resultados, public.matriz_decisao_config TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.simulacoes_id_simulacao_seq, public.simulacao_modelos_id_seq,
  public.simulacao_resultados_id_seq TO anon, authenticated, service_role;

-- Gravação atômica de uma simulação (nova ou substituindo uma existente):
-- grava o registro, os modelos e os resultados numa única transação.
-- Roda com as permissões de quem chama (RLS: só o dono grava as suas).
CREATE OR REPLACE FUNCTION public.gravar_simulacao(
  p_id_simulacao INTEGER,
  p_titulo TEXT,
  p_descricao TEXT,
  p_parametros JSONB,
  p_serie JSONB,
  p_modelos JSONB,
  p_resultados JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_id INTEGER;
BEGIN
  IF p_titulo IS NULL OR btrim(p_titulo) = '' THEN
    RAISE EXCEPTION 'O título da simulação é obrigatório.';
  END IF;

  IF p_id_simulacao IS NULL THEN
    INSERT INTO public.simulacoes (titulo, descricao, parametros, serie_mensal, gravado_em)
    VALUES (btrim(p_titulo), NULLIF(btrim(COALESCE(p_descricao, '')), ''), COALESCE(p_parametros, '{}'), COALESCE(p_serie, '[]'), NOW())
    RETURNING id_simulacao INTO v_id;
  ELSE
    UPDATE public.simulacoes
       SET titulo = btrim(p_titulo),
           descricao = NULLIF(btrim(COALESCE(p_descricao, '')), ''),
           parametros = COALESCE(p_parametros, '{}'),
           serie_mensal = COALESCE(p_serie, '[]'),
           gravado_em = NOW()
     WHERE id_simulacao = p_id_simulacao
     RETURNING id_simulacao INTO v_id;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'Simulação não encontrada ou sem permissão para alterá-la.';
    END IF;
    DELETE FROM public.simulacao_modelos WHERE id_simulacao = v_id;
    DELETE FROM public.simulacao_resultados WHERE id_simulacao = v_id;
  END IF;

  INSERT INTO public.simulacao_modelos (id_simulacao, id_mod, id_mod_original, id_fonte, nome_fonte, cenarios, estrategias)
  SELECT v_id,
         (SELECT m.id_mod FROM public.modelos m WHERE m.id_mod = r.id_mod),
         r.id_mod, r.id_fonte, r.nome_fonte,
         COALESCE(r.cenarios, '[]'), COALESCE(r.estrategias, '[]')
  FROM jsonb_to_recordset(COALESCE(p_modelos, '[]')) AS r(id_mod INTEGER, id_fonte INTEGER, nome_fonte VARCHAR, cenarios JSONB, estrategias JSONB);

  INSERT INTO public.simulacao_resultados (id_simulacao, indicador, id_fonte, valor)
  SELECT v_id, r.indicador, r.id_fonte, r.valor
  FROM jsonb_to_recordset(COALESCE(p_resultados, '[]')) AS r(indicador VARCHAR, id_fonte INTEGER, valor DOUBLE PRECISION);

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.gravar_simulacao(INTEGER, TEXT, TEXT, JSONB, JSONB, JSONB, JSONB) TO authenticated;
