DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='dados_simulacao' and column_name='capex') THEN
      ALTER TABLE public.dados_simulacao RENAME COLUMN capex TO capex_estrategia;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.modelos (
    id_mod SERIAL PRIMARY KEY,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    cenario VARCHAR(255),
    estrategia VARCHAR(255),
    arq_mod TEXT,
    arq_perdas TEXT,
    arq_demanda TEXT,
    arq_capex_estrategias TEXT,
    arq_capex_perdas TEXT,
    arq_opex TEXT
);

CREATE TABLE IF NOT EXISTS public.indicadores (
    id_indicador SERIAL PRIMARY KEY,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    descricao VARCHAR(50),
    unidade VARCHAR(15),
    campo_extra VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS public.indicadores_aplicado (
    id_ia SERIAL PRIMARY KEY,
    id_s INTEGER REFERENCES public.simulacao_ssd(id_s) ON DELETE CASCADE,
    id_indicador INTEGER REFERENCES public.indicadores(id_indicador) ON DELETE CASCADE,
    arquivo VARCHAR(200)
);

ALTER TABLE public.dados_simulacao DROP CONSTRAINT IF EXISTS dados_simulacao_id_c_fkey;
ALTER TABLE public.dados_simulacao DROP CONSTRAINT IF EXISTS dados_simulacao_id_cc_fkey;
ALTER TABLE public.dados_simulacao DROP CONSTRAINT IF EXISTS dados_simulacao_id_cd_fkey;
ALTER TABLE public.dados_simulacao DROP CONSTRAINT IF EXISTS dados_simulacao_id_cp_fkey;
ALTER TABLE public.dados_simulacao DROP CONSTRAINT IF EXISTS dados_simulacao_id_tc_fkey;

ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_tc;
ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_c;
ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_cd;
ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_cc;
ALTER TABLE public.dados_simulacao DROP COLUMN IF EXISTS id_cp;

ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS id_mod INTEGER REFERENCES public.modelos(id_mod) ON DELETE CASCADE;
ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS capex_perdas DOUBLE PRECISION;
ALTER TABLE public.dados_simulacao ADD COLUMN IF NOT EXISTS valores_extras JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS total_capex DOUBLE PRECISION;
ALTER TABLE public.simulacao_ssd ADD COLUMN IF NOT EXISTS media_reducao_perdas DOUBLE PRECISION;

-- RLS
ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_aplicado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modelos_all" ON public.modelos;
CREATE POLICY "modelos_all" ON public.modelos FOR ALL USING (true);

DROP POLICY IF EXISTS "indicadores_all" ON public.indicadores;
CREATE POLICY "indicadores_all" ON public.indicadores FOR ALL USING (true);

DROP POLICY IF EXISTS "indicadores_aplicado_all" ON public.indicadores_aplicado;
CREATE POLICY "indicadores_aplicado_all" ON public.indicadores_aplicado FOR ALL USING (true);

-- Insert Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('dados_brutos', 'dados_brutos', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "dados_brutos_public_read" ON storage.objects;
CREATE POLICY "dados_brutos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'dados_brutos');

DROP POLICY IF EXISTS "dados_brutos_public_insert" ON storage.objects;
CREATE POLICY "dados_brutos_public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dados_brutos');

DROP POLICY IF EXISTS "dados_brutos_public_update" ON storage.objects;
CREATE POLICY "dados_brutos_public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'dados_brutos');

DROP POLICY IF EXISTS "dados_brutos_public_delete" ON storage.objects;
CREATE POLICY "dados_brutos_public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'dados_brutos');
