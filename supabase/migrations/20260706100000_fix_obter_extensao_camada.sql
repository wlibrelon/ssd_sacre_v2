-- ============================================================
-- Correção: obter_extensao_camada retornava um objeto GeoJSON
-- (ST_AsGeoJSON), mas o frontend espera o array
-- [minLon, minLat, maxLon, maxLat] para a prop `bounds` do mapa.
-- ============================================================

CREATE OR REPLACE FUNCTION public.obter_extensao_camada(p_id_camada uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_array(ST_XMin(bbox), ST_YMin(bbox), ST_XMax(bbox), ST_YMax(bbox))
    INTO v_result
  FROM public.camadas_mapa
  WHERE id_camada = p_id_camada
    AND bbox IS NOT NULL;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
