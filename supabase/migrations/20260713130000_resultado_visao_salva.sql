-- ============================================================
-- Módulo de Projetos > Resultados: visões salvas de consulta
-- ------------------------------------------------------------
-- Guarda a configuração de uma consulta montada no construtor
-- (métrica + agregação + agrupamento + filtros) para reuso,
-- exatamente no mesmo padrão que public.selecao_cenarios já usa
-- para salvar a seleção de cenário de cada usuário no SSD:
-- tabela própria, id_usuario preenchido via supabase.auth.getUser()
-- no client, sem mecanismo novo de persistência.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resultado_visao_salva (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tabela UUID REFERENCES public.resultado_tabela(id) ON DELETE CASCADE,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb, -- { metrica, agregacao, agruparPor, filtros }
    criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resultado_visao_salva_tabela ON public.resultado_visao_salva(id_tabela);
CREATE INDEX IF NOT EXISTS idx_resultado_visao_salva_usuario ON public.resultado_visao_salva(id_usuario);

-- ── RLS: mesmo padrão global do resto do schema ──
ALTER TABLE public.resultado_visao_salva ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_resultado_visao_salva" ON public.resultado_visao_salva;
CREATE POLICY "anon_read_resultado_visao_salva" ON public.resultado_visao_salva FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_all_resultado_visao_salva" ON public.resultado_visao_salva;
CREATE POLICY "auth_all_resultado_visao_salva" ON public.resultado_visao_salva FOR ALL TO authenticated USING (true) WITH CHECK (true);
