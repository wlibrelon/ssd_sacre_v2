-- ============================================================
-- Correção: o upsert da importação usa
-- ON CONFLICT (id_s, id_mod, id_fonte, tempo), mas o índice único
-- criado no schema tinha só (id_mod, id_fonte, tempo).
-- Alinha o índice ao código.
-- ============================================================

DROP INDEX IF EXISTS public.dados_simulacao_mod_fonte_tempo_key;

CREATE UNIQUE INDEX IF NOT EXISTS dados_simulacao_s_mod_fonte_tempo_key
  ON public.dados_simulacao (id_s, id_mod, id_fonte, tempo);
