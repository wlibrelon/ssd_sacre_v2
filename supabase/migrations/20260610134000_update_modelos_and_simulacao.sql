DO $$
BEGIN
  ALTER TABLE public.modelos ALTER COLUMN cenario TYPE jsonb USING CASE WHEN cenario IS NULL OR cenario = '' THEN '[]'::jsonb ELSE '[]'::jsonb END;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE public.modelos ALTER COLUMN cenario TYPE jsonb USING '[]'::jsonb;
END $$;

DO $$
BEGIN
  ALTER TABLE public.modelos ALTER COLUMN estrategia TYPE jsonb USING CASE WHEN estrategia IS NULL OR estrategia = '' THEN '[]'::jsonb ELSE '[]'::jsonb END;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE public.modelos ALTER COLUMN estrategia TYPE jsonb USING '[]'::jsonb;
END $$;

ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS cenarios jsonb;
ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS estrategias jsonb;
