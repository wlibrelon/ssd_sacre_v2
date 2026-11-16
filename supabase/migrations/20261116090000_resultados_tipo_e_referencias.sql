-- ============================================================
-- Projetos > Resultados: separação Dados Brutos / Dados Tratados
-- e referências bibliográficas por projeto
-- ------------------------------------------------------------
-- 1. resultado_tabela.tipo -> 'bruto' | 'tratado'
--    Tabelas já existentes passam a ser 'tratado' (antiga aba
--    "Tabelas de Dados").
-- 2. projeto_referencia -> referências do projeto (descrição +
--    link DOI e/ou PDF anexado no bucket artigos_referencia)
-- ============================================================

ALTER TABLE public.resultado_tabela
    ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'tratado';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resultado_tabela_tipo_check'
  ) THEN
    ALTER TABLE public.resultado_tabela
      ADD CONSTRAINT resultado_tabela_tipo_check CHECK (tipo IN ('bruto', 'tratado'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_resultado_tabela_projeto_tipo
    ON public.resultado_tabela(id_projeto, tipo);

CREATE TABLE IF NOT EXISTS public.projeto_referencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_projeto INTEGER NOT NULL REFERENCES public.projetos_wps(id_projeto) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    doi TEXT,
    arquivo TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projeto_referencia_projeto ON public.projeto_referencia(id_projeto);

-- ── RLS: mesmo padrão global do resto do schema ──
ALTER TABLE public.projeto_referencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_projeto_referencia" ON public.projeto_referencia;
CREATE POLICY "anon_read_projeto_referencia" ON public.projeto_referencia FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_all_projeto_referencia" ON public.projeto_referencia;
CREATE POLICY "auth_all_projeto_referencia" ON public.projeto_referencia FOR ALL TO authenticated USING (true) WITH CHECK (true);
