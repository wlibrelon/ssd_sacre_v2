-- Tipo de geometria (point/line/polygon) de cada camada vetorial.
--
-- Usado para desenhar automaticamente o símbolo certo na legenda do mapa
-- (ver renderLegend em src/pages/area-estudo/Camadas.tsx). Antes, a legenda
-- exigia configuração manual por camada (cor + tipo + rótulo digitados um a
-- um); camadas sem essa configuração simplesmente não apareciam na legenda,
-- mesmo com a camada marcada como visível e sendo desenhada no mapa
-- normalmente — esse é o bug relatado de "só aparecem até 4 camadas na
-- legenda" (só as primeiras camadas cadastradas tinham a legenda preenchida
-- manualmente). Com o tipo de geometria conhecido, a legenda passa a ser
-- gerada automaticamente para toda camada vetorial ativa.
ALTER TABLE public.camadas_mapa
  ADD COLUMN IF NOT EXISTS tipo_geometria TEXT;

-- Backfill: preenche o tipo de geometria das camadas vetoriais já
-- importadas a partir do tipo real das feições já gravadas — não depende de
-- reimportar o arquivo para corrigir camadas existentes.
UPDATE public.camadas_mapa cm
SET tipo_geometria = tipos.tipo
FROM (
  SELECT
    fg.id_camada,
    CASE
      WHEN bool_or(ST_GeometryType(fg.geom) IN ('ST_Point', 'ST_MultiPoint')) THEN 'point'
      WHEN bool_or(ST_GeometryType(fg.geom) IN ('ST_LineString', 'ST_MultiLineString')) THEN 'line'
      WHEN bool_or(ST_GeometryType(fg.geom) IN ('ST_Polygon', 'ST_MultiPolygon')) THEN 'polygon'
      ELSE NULL
    END AS tipo
  FROM public.feicoes_geoespaciais fg
  WHERE fg.geom IS NOT NULL
  GROUP BY fg.id_camada
) AS tipos
WHERE cm.id_camada = tipos.id_camada
  AND cm.tipo_geometria IS NULL
  AND tipos.tipo IS NOT NULL;

-- A importação (src/lib/importacao-camadas.ts) agora detecta o tipo de
-- geometria a partir do próprio shapefile e passa para
-- finalizar_importacao_vetorial, que grava junto com o resto do resumo da
-- importação. p_tipo_geometria é opcional (default NULL) para não quebrar
-- chamadas antigas.
CREATE OR REPLACE FUNCTION public.finalizar_importacao_vetorial(
  p_id_camada uuid,
  p_total integer,
  p_tipo_geometria text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.camadas_mapa
  SET
    bbox = (SELECT ST_Envelope(ST_Collect(geom)) FROM public.feicoes_geoespaciais WHERE id_camada = p_id_camada),
    status_importacao = 'importado',
    total_feicoes = p_total,
    importado_em = NOW(),
    mensagem_erro = NULL,
    tipo_geometria = COALESCE(p_tipo_geometria, tipo_geometria)
  WHERE id_camada = p_id_camada;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
