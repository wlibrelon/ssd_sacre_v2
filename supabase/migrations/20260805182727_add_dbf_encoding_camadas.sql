-- Codificação de texto usada para ler os atributos (.dbf) do shapefile na
-- importação. A biblioteca usada no cliente decodifica como ISO-8859-1
-- (Latin1) por padrão; muitos shapefiles brasileiros mais recentes (QGIS,
-- ferramentas modernas) usam UTF-8, o que sem essa opção gera mojibake em
-- textos com acentuação (ex.: "ção" vira "Ã§Ã£o"). Permite escolher por
-- camada, já que a origem varia conforme quem gerou o arquivo.
ALTER TABLE public.camadas_mapa
  ADD COLUMN IF NOT EXISTS dbf_encoding TEXT DEFAULT 'latin1';
