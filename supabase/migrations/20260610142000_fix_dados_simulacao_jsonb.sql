DO $$
BEGIN
  -- Add columns if they do not exist
  ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS cenarios jsonb;
  ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS estrategias jsonb;
END $$;

-- Drop dependent policies just in case before altering type
DROP POLICY IF EXISTS "anon_read" ON public.dados_simulacao;
DROP POLICY IF EXISTS "authenticated_all" ON public.dados_simulacao;

DO $$
BEGIN
  -- Clean up any potential empty strings that cannot be cast to jsonb
  UPDATE public.dados_simulacao 
  SET cenarios = '{}'::jsonb 
  WHERE cenarios::text = '' OR cenarios::text = '""';

  -- Ensure they are explicitly jsonb, migrating any text data if needed
  ALTER TABLE public.dados_simulacao 
    ALTER COLUMN cenarios TYPE jsonb USING (
      CASE 
        WHEN cenarios IS NULL THEN NULL 
        ELSE cenarios::text::jsonb 
      END
    );
EXCEPTION WHEN OTHERS THEN
  -- Fallback ignore error if cast fails due to bad data
END $$;

DO $$
BEGIN
  -- Clean up any potential empty strings that cannot be cast to jsonb
  UPDATE public.dados_simulacao 
  SET estrategias = '[]'::jsonb 
  WHERE estrategias::text = '' OR estrategias::text = '""';

  -- Ensure they are explicitly jsonb, migrating any text data if needed
  ALTER TABLE public.dados_simulacao 
    ALTER COLUMN estrategias TYPE jsonb USING (
      CASE 
        WHEN estrategias IS NULL THEN NULL 
        ELSE estrategias::text::jsonb 
      END
    );
EXCEPTION WHEN OTHERS THEN
  -- Fallback ignore error if cast fails due to bad data
END $$;

-- Recreate policies
CREATE POLICY "anon_read" ON public.dados_simulacao 
  FOR SELECT TO anon USING (true);

CREATE POLICY "authenticated_all" ON public.dados_simulacao 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
