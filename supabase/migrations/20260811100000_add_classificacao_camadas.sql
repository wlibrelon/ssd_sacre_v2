-- Classificação temática dos valores do atributo principal de uma camada
-- vetorial (categórico: uma cor sólida por valor distinto; graduado: cores
-- em faixas de valores numéricos — Intervalo Igual ou Quantidade Igual,
-- como no QGIS). Ver bloco "Classificação" em CamadaFormModal.tsx e o
-- desenho das feições em GeoJSONLayer.tsx / src/lib/classificacao.ts.
ALTER TABLE public.camadas_mapa
  ADD COLUMN IF NOT EXISTS campo_classificacao TEXT,
  ADD COLUMN IF NOT EXISTS tipo_classificacao TEXT,
  ADD COLUMN IF NOT EXISTS classificacao JSONB DEFAULT '{}'::jsonb;

-- Valores distintos de um atributo (e sua frequência), usados no cadastro
-- para gerar automaticamente as categorias da classificação categórica.
-- Limitado aos 40 valores mais frequentes — atributos com cardinalidade
-- maior que isso normalmente não são um bom candidato a classificação
-- categórica (a legenda ficaria enorme); o admin ainda pode remover/ajustar
-- categorias manualmente depois de geradas.
CREATE OR REPLACE FUNCTION public.obter_valores_distintos_atributo(
  p_id_camada uuid,
  p_campo text
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(t ORDER BY t.valor), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT propriedades->>p_campo AS valor, count(*) AS total
    FROM public.feicoes_geoespaciais
    WHERE id_camada = p_id_camada
      AND propriedades ? p_campo
      AND propriedades->>p_campo IS NOT NULL
      AND propriedades->>p_campo <> ''
    GROUP BY propriedades->>p_campo
    ORDER BY count(*) DESC
    LIMIT 40
  ) t;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Estatísticas numéricas de um atributo (min, max e a lista de valores
-- ordenada), usadas no cadastro para calcular as faixas da classificação
-- graduada (Intervalo Igual ou Quantidade Igual). Valores que não parecem
-- numéricos são ignorados silenciosamente (em vez de quebrar com erro de
-- cast), já que atributos de shapefile costumam ter texto e número
-- misturados por erro de digitação na fonte original.
-- O LIMIT 20000 é uma proteção contra camadas muito grandes; camadas
-- típicas deste projeto (bairros, setores, unidades de estudo) ficam bem
-- abaixo disso.
CREATE OR REPLACE FUNCTION public.obter_estatisticas_numericas_atributo(
  p_id_camada uuid,
  p_campo text
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  WITH valores AS (
    SELECT (propriedades->>p_campo)::numeric AS valor
    FROM public.feicoes_geoespaciais
    WHERE id_camada = p_id_camada
      AND propriedades ? p_campo
      AND propriedades->>p_campo ~ '^-?[0-9]+(\.[0-9]+)?$'
    ORDER BY (propriedades->>p_campo)::numeric
    LIMIT 20000
  )
  SELECT jsonb_build_object(
    'min', (SELECT min(valor) FROM valores),
    'max', (SELECT max(valor) FROM valores),
    'total', (SELECT count(*) FROM valores),
    'valores', COALESCE((SELECT jsonb_agg(valor) FROM valores), '[]'::jsonb)
  )
  INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
