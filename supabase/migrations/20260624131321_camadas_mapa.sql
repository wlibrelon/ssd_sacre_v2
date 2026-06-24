-- 1. PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Catalog Table (camadas_mapa)
CREATE TABLE IF NOT EXISTS public.camadas_mapa (
    id_camada UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL,
    tipo_dados TEXT NOT NULL CHECK (tipo_dados IN ('vetorial', 'raster')),
    tabela_origem TEXT,
    fonte_raster_url TEXT,
    estilo JSONB DEFAULT '{}'::jsonb,
    legenda JSONB DEFAULT '[]'::jsonb,
    zoom_min INT DEFAULT 0,
    zoom_max INT DEFAULT 22,
    bbox geometry(Polygon, 4326),
    ordem_exibicao INT DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    visivel_por_padrao BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Geospatial Data Table (feicoes_geoespaciais)
CREATE TABLE IF NOT EXISTS public.feicoes_geoespaciais (
    id_feicao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_camada UUID REFERENCES public.camadas_mapa(id_camada) ON DELETE CASCADE,
    geom geometry(Geometry, 4326),
    nome_feicao TEXT,
    propriedades JSONB DEFAULT '{}'::jsonb
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_feicoes_geoespaciais_geom ON public.feicoes_geoespaciais USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_feicoes_geoespaciais_camada ON public.feicoes_geoespaciais (id_camada);

-- 5. Spatial RPC (obter_feicoes_camada)
CREATE OR REPLACE FUNCTION public.obter_feicoes_camada(
    p_id_camada UUID,
    p_min_lon DOUBLE PRECISION,
    p_min_lat DOUBLE PRECISION,
    p_max_lon DOUBLE PRECISION,
    p_max_lat DOUBLE PRECISION,
    p_zoom INT DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
    v_bbox geometry;
    v_tolerance DOUBLE PRECISION;
    v_result JSONB;
BEGIN
    -- Create bounding box from coordinates
    v_bbox := ST_MakeEnvelope(p_min_lon, p_min_lat, p_max_lon, p_max_lat, 4326);
    
    -- Calculate simplification tolerance based on zoom level
    -- Zoom 0: 360 degrees / 256 pixels ~= 1.4 deg/pixel
    v_tolerance := 360.0 / (256.0 * power(2, p_zoom));

    SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(
            jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, v_tolerance))::jsonb,
                'properties', propriedades || jsonb_build_object('id_feicao', id_feicao, 'nome', nome_feicao)
            )
        ), '[]'::jsonb)
    )
    INTO v_result
    FROM public.feicoes_geoespaciais
    WHERE id_camada = p_id_camada
      AND geom && v_bbox;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.camadas_mapa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_camadas_mapa" ON public.camadas_mapa;
CREATE POLICY "anon_read_camadas_mapa" ON public.camadas_mapa FOR SELECT USING (true);

ALTER TABLE public.feicoes_geoespaciais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_feicoes_geoespaciais" ON public.feicoes_geoespaciais;
CREATE POLICY "anon_read_feicoes_geoespaciais" ON public.feicoes_geoespaciais FOR SELECT USING (true);

-- Insert Mock Data
DO $$
DECLARE
    v_camada_hidro UUID := gen_random_uuid();
    v_camada_uso UUID := gen_random_uuid();
    v_camada_chuva UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.camadas_mapa (id_camada, nome, descricao, categoria, tipo_dados, estilo, legenda, ativo, visivel_por_padrao, ordem_exibicao)
    VALUES (
        v_camada_hidro, 'Rios Principais', 'Principais cursos d''água da região metropolitana', 'Hidrografia', 'vetorial',
        '{"color": "#3b82f6", "weight": 3}'::jsonb,
        '[{"label": "Rio Principal", "color": "#3b82f6", "type": "line"}]'::jsonb,
        true, true, 1
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.camadas_mapa (id_camada, nome, descricao, categoria, tipo_dados, estilo, legenda, ativo, visivel_por_padrao, ordem_exibicao)
    VALUES (
        v_camada_uso, 'Áreas Urbanas', 'Manchas de ocupação urbana e metropolitana', 'Uso do Solo', 'vetorial',
        '{"fillColor": "#ef4444", "fillOpacity": 0.4, "color": "#b91c1c", "weight": 1}'::jsonb,
        '[{"label": "Mancha Urbana", "color": "#ef4444", "type": "polygon"}]'::jsonb,
        true, false, 2
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO public.camadas_mapa (id_camada, nome, descricao, categoria, tipo_dados, fonte_raster_url, legenda, ativo, visivel_por_padrao, ordem_exibicao)
    VALUES (
        v_camada_chuva, 'Precipitação Média', 'Dados rasterizados de chuva (Demonstração OpenWeather)', 'Clima', 'raster',
        'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=demo',
        '[{"label": "Baixa Precip.", "color": "#e0f2fe", "type": "polygon"}, {"label": "Alta Precip.", "color": "#0369a1", "type": "polygon"}]'::jsonb,
        true, false, 3
    ) ON CONFLICT DO NOTHING;

    -- Add a line feature (river) near SP (-46.6333, -23.5505)
    INSERT INTO public.feicoes_geoespaciais (id_camada, nome_feicao, geom, propriedades)
    VALUES (
        v_camada_hidro,
        'Rio Tietê',
        ST_GeomFromText('LINESTRING(-46.8 -23.5, -46.7 -23.52, -46.6 -23.51, -46.5 -23.49)', 4326),
        '{"classificacao": "perene"}'::jsonb
    );

    -- Add a polygon feature (city)
    INSERT INTO public.feicoes_geoespaciais (id_camada, nome_feicao, geom, propriedades)
    VALUES (
        v_camada_uso,
        'Centro SP',
        ST_GeomFromText('POLYGON((-46.65 -23.56, -46.61 -23.56, -46.61 -23.53, -46.65 -23.53, -46.65 -23.56))', 4326),
        '{"populacao": 1500000}'::jsonb
    );
END $$;
