ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS limiar_alerta double precision;
ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS limiar_crise double precision;
ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS limiar_colapso double precision;
