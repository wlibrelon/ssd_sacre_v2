DO $$
BEGIN
  -- cenario_demanda
  ALTER TABLE public.cenario_demanda ADD COLUMN IF NOT EXISTS percentual DOUBLE PRECISION;

  -- cenario_consumo
  ALTER TABLE public.cenario_consumo ADD COLUMN IF NOT EXISTS vol_hab DOUBLE PRECISION;

  -- cenario_perdas
  ALTER TABLE public.cenario_perdas ADD COLUMN IF NOT EXISTS percentual DOUBLE PRECISION;

  -- simulacao_ssd
  ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS demanda_auto BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS perdas_auto BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS pop_inicial DOUBLE PRECISION;
  ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS inicio_perdas VARCHAR(7);
  ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS perc_inicial_perdas DOUBLE PRECISION;
END $$;
