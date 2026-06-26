DO $$
BEGIN
  -- 1. Create tables if they do not exist
  CREATE TABLE IF NOT EXISTS public.indicadores (
    id_indicador SERIAL PRIMARY KEY,
    id_fonte INT REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    descricao VARCHAR(50),
    unidade VARCHAR(15),
    campo_extra VARCHAR(30)
  );

  CREATE TABLE IF NOT EXISTS public.indicadores_aplicado (
    id_ia SERIAL PRIMARY KEY,
    id_s INT REFERENCES public.simulacao_ssd(id_s) ON DELETE CASCADE,
    id_indicador INT REFERENCES public.indicadores(id_indicador) ON DELETE CASCADE,
    arquivo VARCHAR(200)
  );

  -- 2. Drop RLS policies to make script idempotent
  DROP POLICY IF EXISTS "indicadores_all" ON public.indicadores;
  DROP POLICY IF EXISTS "indicadores_aplicado_all" ON public.indicadores_aplicado;
  
  -- 3. Create RLS policies
  ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "indicadores_all" ON public.indicadores 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
  
  ALTER TABLE public.indicadores_aplicado ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "indicadores_aplicado_all" ON public.indicadores_aplicado 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 4. Update dados_simulacao columns
  -- Add id_mod
  ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS id_mod INT REFERENCES public.modelos(id_mod) ON DELETE CASCADE;
  
  -- Rename capex to capex_estrategia
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dados_simulacao' AND column_name = 'capex') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dados_simulacao' AND column_name = 'capex_estrategia') THEN
      ALTER TABLE public.dados_simulacao RENAME COLUMN capex TO capex_estrategia;
    END IF;
  END IF;
  
  -- Ensure capex_estrategia exists in case capex didn't exist
  ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS capex_estrategia DOUBLE PRECISION;
  
  -- Add capex_perdas
  ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS capex_perdas DOUBLE PRECISION;

  -- Remove unused columns
  ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_tc;
  ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_c;
  ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_cd;
  ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_cc;
  ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_cp;

  -- 5. Create a UNIQUE constraint to allow upserts by composite key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dados_simulacao_ukey'
  ) THEN
    ALTER TABLE public.dados_simulacao ADD CONSTRAINT dados_simulacao_ukey UNIQUE (id_s, id_mod, id_fonte, tempo);
  END IF;

END $$;
