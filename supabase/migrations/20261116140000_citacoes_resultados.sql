-- ============================================================
-- Projetos > Resultados: citação sugerida ao usuário final
-- ------------------------------------------------------------
-- Ordem de exibição no módulo Resultados:
--   1. citacao do próprio resultado (arquivo ou tabela)
--   2. projetos_wps.citacao_padrao
--   3. citação gerada automaticamente pelo app
-- Texto livre (o pesquisador cola a citação já formatada).
-- ============================================================

ALTER TABLE public.arq_resultados   ADD COLUMN IF NOT EXISTS citacao TEXT;
ALTER TABLE public.resultado_tabela ADD COLUMN IF NOT EXISTS citacao TEXT;
ALTER TABLE public.projetos_wps     ADD COLUMN IF NOT EXISTS citacao_padrao TEXT;
