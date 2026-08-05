-- Lista de atributos (colunas do shapefile) que devem ser exibidos na janela
-- de detalhes ao clicar numa feição no mapa. Quando vazio/nulo, a interface
-- cai de volta para mostrar todos os atributos (comportamento anterior).
ALTER TABLE public.camadas_mapa
  ADD COLUMN IF NOT EXISTS campos_exibicao JSONB DEFAULT '[]'::jsonb;
