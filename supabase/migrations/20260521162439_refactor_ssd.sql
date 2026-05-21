-- Drop foreign keys first to allow renaming
ALTER TABLE IF EXISTS public.cenario_simulacao DROP CONSTRAINT IF EXISTS cenario_simulacao_id_e_fkey;
ALTER TABLE IF EXISTS public.dados_simulacao DROP CONSTRAINT IF EXISTS dados_simulacao_id_e_fkey;
ALTER TABLE IF EXISTS public.estrategias_fonte DROP CONSTRAINT IF EXISTS estrategias_fonte_id_e_fkey;

-- Rename the main table
ALTER TABLE IF EXISTS public.estrategias RENAME TO acoes;

-- Rename its columns
ALTER TABLE IF EXISTS public.acoes RENAME COLUMN id_estrategia TO id_acao;
ALTER TABLE IF EXISTS public.acoes RENAME COLUMN obs_estrategia TO obs;

-- Rename relation table and columns
ALTER TABLE IF EXISTS public.estrategias_fonte RENAME TO acoes_fonte;
ALTER TABLE IF EXISTS public.acoes_fonte RENAME COLUMN id_e TO id_acao;

-- Rename foreign key columns in other tables
ALTER TABLE IF EXISTS public.cenario_simulacao RENAME COLUMN id_e TO id_acao;
ALTER TABLE IF EXISTS public.dados_simulacao RENAME COLUMN id_e TO id_acao;

-- Re-add foreign key constraints pointing to the new table name and column
ALTER TABLE public.cenario_simulacao 
  ADD CONSTRAINT cenario_simulacao_id_acao_fkey FOREIGN KEY (id_acao) REFERENCES public.acoes(id_acao) ON DELETE CASCADE;

ALTER TABLE public.dados_simulacao 
  ADD CONSTRAINT dados_simulacao_id_acao_fkey FOREIGN KEY (id_acao) REFERENCES public.acoes(id_acao) ON DELETE CASCADE;

ALTER TABLE public.acoes_fonte 
  ADD CONSTRAINT acoes_fonte_id_acao_fkey FOREIGN KEY (id_acao) REFERENCES public.acoes(id_acao) ON DELETE CASCADE;

-- Create new CAPEX/OPEX tables
CREATE TABLE IF NOT EXISTS public.capex_acao (
    id_ca SERIAL PRIMARY KEY,
    id_acao INTEGER REFERENCES public.acoes(id_acao) ON DELETE CASCADE,
    tempo VARCHAR(7),
    capex DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.capex_perdas (
    id_cp SERIAL PRIMARY KEY,
    tempo VARCHAR(7),
    capex DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.opex (
    id_oa SERIAL PRIMARY KEY,
    tempo VARCHAR(7),
    opex DOUBLE PRECISION
);

-- Remove descricao column from cenario_perdas
ALTER TABLE IF EXISTS public.cenario_perdas DROP COLUMN IF EXISTS descricao;

-- Set up Row Level Security (RLS) policies for new tables
ALTER TABLE public.capex_acao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read" ON public.capex_acao;
CREATE POLICY "anon_read" ON public.capex_acao FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.capex_acao;
CREATE POLICY "authenticated_all" ON public.capex_acao FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.capex_perdas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read" ON public.capex_perdas;
CREATE POLICY "anon_read" ON public.capex_perdas FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.capex_perdas;
CREATE POLICY "authenticated_all" ON public.capex_perdas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.opex ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read" ON public.opex;
CREATE POLICY "anon_read" ON public.opex FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.opex;
CREATE POLICY "authenticated_all" ON public.opex FOR ALL TO authenticated USING (true) WITH CHECK (true);
