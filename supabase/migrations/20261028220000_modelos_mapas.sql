-- Mapas associados a um modelo (shapefile e/ou raster), exibidos na aba
-- "Mapa" da Simulação como informação complementar aos resultados.
--   arq_shape / arq_raster : caminho do arquivo no bucket dados_brutos
--                            (.zip com o shapefile; GeoTIFF .tif)
--   desc_shape / desc_raster: descrição de cada mapa
--   config_mapa            : configuração de exibição salva na aba Mapa
--                            ({ "shape": {...}, "raster": {...} })
ALTER TABLE public.modelos
  ADD COLUMN IF NOT EXISTS arq_shape VARCHAR,
  ADD COLUMN IF NOT EXISTS desc_shape VARCHAR,
  ADD COLUMN IF NOT EXISTS arq_raster VARCHAR,
  ADD COLUMN IF NOT EXISTS desc_raster VARCHAR,
  ADD COLUMN IF NOT EXISTS config_mapa JSONB DEFAULT '{}'::jsonb;
