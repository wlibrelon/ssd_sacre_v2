-- ============================================================
-- Módulo de Projetos > Resultados: tabelas de dados dinâmicas
-- ------------------------------------------------------------
-- Escopo desta fase (decidido com o usuário): SEM cruzamento
-- entre tabelas. Cada tabela de resultado é analisada isolada-
-- mente, com um dicionário de colunas que permite ao usuário
-- montar seleção (métrica + agregação), agrupamento e filtro
-- sem escrever SQL. A agregação em si é feita no frontend.
--
-- 1. resultado_tabela   -> catálogo + documentação obrigatória
-- 2. resultado_coluna   -> dicionário de dados (1 linha/coluna)
-- 3. resultado_linha    -> dados em si, 1 linha por registro do
--                          CSV, em JSONB (mesmo padrão já usado
--                          em feicoes_geoespaciais.propriedades
--                          e indicadores_aplicado/valores_extras)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resultado_tabela (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_projeto INTEGER REFERENCES public.projetos_wps(id_projeto) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao_resumida TEXT,
    objetivo_resultado TEXT,
    origem_pesquisa TEXT,
    metodologia TEXT,
    arquivo_original TEXT,
    status TEXT DEFAULT 'rascunho',
    total_linhas INTEGER DEFAULT 0,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resultado_tabela_projeto ON public.resultado_tabela(id_projeto);

CREATE TABLE IF NOT EXISTS public.resultado_coluna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tabela UUID REFERENCES public.resultado_tabela(id) ON DELETE CASCADE,
    nome_original TEXT NOT NULL,
    rotulo_amigavel TEXT,
    tipo_detectado TEXT DEFAULT 'texto', -- numerico | data | categorico | texto
    papel TEXT DEFAULT 'ignorar',        -- dimensao | metrica | identificador | ignorar
    unidade TEXT,
    agregacoes_permitidas JSONB DEFAULT '[]'::jsonb,
    ordem INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_resultado_coluna_tabela ON public.resultado_coluna(id_tabela);

CREATE TABLE IF NOT EXISTS public.resultado_linha (
    id BIGSERIAL PRIMARY KEY,
    id_tabela UUID REFERENCES public.resultado_tabela(id) ON DELETE CASCADE,
    linha JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_resultado_linha_tabela ON public.resultado_linha(id_tabela);
CREATE INDEX IF NOT EXISTS idx_resultado_linha_gin ON public.resultado_linha USING GIN (linha);

-- ── RPC: importação em lote das linhas (mesmo padrão de importar_feicoes_lote) ──
CREATE OR REPLACE FUNCTION public.importar_linhas_resultado_lote(p_id_tabela uuid, p_linhas jsonb)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.resultado_linha (id_tabela, linha)
  SELECT p_id_tabela, item
  FROM jsonb_array_elements(p_linhas) AS item;

  SELECT count(*) INTO v_count FROM public.resultado_linha WHERE id_tabela = p_id_tabela;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── RLS: mesmo padrão global do resto do schema (leitura anônima, escrita autenticada) ──
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY['resultado_tabela', 'resultado_coluna', 'resultado_linha'];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

        EXECUTE format('DROP POLICY IF EXISTS "anon_read_%I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "anon_read_%I" ON public.%I FOR SELECT USING (true);', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS "auth_all_%I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "auth_all_%I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
