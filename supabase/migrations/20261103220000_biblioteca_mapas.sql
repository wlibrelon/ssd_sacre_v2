-- Biblioteca de mapas da simulação: cada mapa (shapefile .zip ou raster
-- GeoTIFF do bucket dados_brutos) é cadastrado e configurado uma única vez
-- e pode ser associado a vários modelos, com ordem e visibilidade inicial.
-- Substitui os campos fixos arq_shape/arq_raster/desc_*/config_mapa da
-- tabela modelos (um shape e um raster por modelo).

CREATE TABLE IF NOT EXISTS public.mapas (
    id_mapa SERIAL PRIMARY KEY,
    tipo VARCHAR NOT NULL CHECK (tipo IN ('shape', 'raster')),
    arquivo VARCHAR NOT NULL,
    descricao VARCHAR,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    criado_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modelo_mapas (
    id SERIAL PRIMARY KEY,
    id_mod INTEGER NOT NULL REFERENCES public.modelos(id_mod) ON DELETE CASCADE,
    id_mapa INTEGER NOT NULL REFERENCES public.mapas(id_mapa) ON DELETE CASCADE,
    ordem INTEGER NOT NULL DEFAULT 0,
    visivel_padrao BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (id_mod, id_mapa)
);
CREATE INDEX IF NOT EXISTS idx_modelo_mapas_mod ON public.modelo_mapas(id_mod);
CREATE INDEX IF NOT EXISTS idx_modelo_mapas_mapa ON public.modelo_mapas(id_mapa);

-- Mesmas políticas das demais tabelas: leitura pública, escrita autenticada
ALTER TABLE public.mapas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_mapas" ON public.mapas;
CREATE POLICY "anon_read_mapas" ON public.mapas FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_all_mapas" ON public.mapas;
CREATE POLICY "auth_all_mapas" ON public.mapas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.modelo_mapas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_modelo_mapas" ON public.modelo_mapas;
CREATE POLICY "anon_read_modelo_mapas" ON public.modelo_mapas FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_all_modelo_mapas" ON public.modelo_mapas;
CREATE POLICY "auth_all_modelo_mapas" ON public.modelo_mapas FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.mapas, public.modelo_mapas TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.mapas_id_mapa_seq, public.modelo_mapas_id_seq TO anon, authenticated, service_role;

-- Migração dos mapas já cadastrados nos modelos (se as colunas antigas
-- existirem). Um mesmo arquivo usado por vários modelos vira um único mapa,
-- com a descrição e a configuração do modelo de menor id_mod.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'modelos' AND column_name = 'arq_shape'
  ) THEN
    INSERT INTO public.mapas (tipo, arquivo, descricao, config)
    SELECT DISTINCT ON (tipo, arquivo) tipo, arquivo, descricao, config
    FROM (
      SELECT 'shape' AS tipo, m.arq_shape AS arquivo, m.desc_shape AS descricao,
             COALESCE(m.config_mapa -> 'shape', '{}'::jsonb) AS config, m.id_mod
      FROM public.modelos m WHERE m.arq_shape IS NOT NULL AND m.arq_shape <> ''
      UNION ALL
      SELECT 'raster', m.arq_raster, m.desc_raster,
             COALESCE(m.config_mapa -> 'raster', '{}'::jsonb), m.id_mod
      FROM public.modelos m WHERE m.arq_raster IS NOT NULL AND m.arq_raster <> ''
    ) origem
    WHERE NOT EXISTS (
      SELECT 1 FROM public.mapas x WHERE x.tipo = origem.tipo AND x.arquivo = origem.arquivo
    )
    ORDER BY tipo, arquivo, id_mod;

    INSERT INTO public.modelo_mapas (id_mod, id_mapa, ordem, visivel_padrao)
    SELECT m.id_mod, mp.id_mapa, CASE WHEN mp.tipo = 'shape' THEN 0 ELSE 1 END, true
    FROM public.modelos m
    JOIN public.mapas mp
      ON (mp.tipo = 'shape' AND mp.arquivo = m.arq_shape)
      OR (mp.tipo = 'raster' AND mp.arquivo = m.arq_raster)
    ON CONFLICT (id_mod, id_mapa) DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.modelos
  DROP COLUMN IF EXISTS arq_shape,
  DROP COLUMN IF EXISTS desc_shape,
  DROP COLUMN IF EXISTS arq_raster,
  DROP COLUMN IF EXISTS desc_raster,
  DROP COLUMN IF EXISTS config_mapa;
