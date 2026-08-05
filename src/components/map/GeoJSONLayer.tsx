import { useContext } from 'react'
import { MapContext } from './SimpleMap'

// ---------------------------------------------------------------------------
// Símbolos de ponto — cada função devolve os pontos (x,y) de um polígono
// regular centrado em (cx, cy), usados para desenhar o símbolo escolhido no
// cadastro da camada (estilo.pointSymbol). O círculo é desenhado à parte
// (elemento <circle>, mais simples/leve que um polígono aproximado).
// ---------------------------------------------------------------------------

export function poligonoRegular(
  cx: number,
  cy: number,
  r: number,
  lados: number,
  rotacaoGraus = -90,
) {
  const pontos: string[] = []
  for (let i = 0; i < lados; i++) {
    const angulo = ((rotacaoGraus + (360 / lados) * i) * Math.PI) / 180
    pontos.push(`${cx + r * Math.cos(angulo)},${cy + r * Math.sin(angulo)}`)
  }
  return pontos.join(' ')
}

export function estrelaPoints(cx: number, cy: number, rOuter: number, pontas = 5) {
  const rInner = rOuter * 0.45
  const pontos: string[] = []
  for (let i = 0; i < pontas * 2; i++) {
    const raio = i % 2 === 0 ? rOuter : rInner
    const angulo = ((-90 + (360 / (pontas * 2)) * i) * Math.PI) / 180
    pontos.push(`${cx + raio * Math.cos(angulo)},${cy + raio * Math.sin(angulo)}`)
  }
  return pontos.join(' ')
}

// ---------------------------------------------------------------------------
// Tipos de linha — mapeia a opção escolhida no cadastro (estilo.lineStyle)
// para um stroke-dasharray. Usado em linhas e na borda de polígonos.
// ---------------------------------------------------------------------------

export function dasharrayPara(lineStyle: string | undefined, weight: number): string | undefined {
  switch (lineStyle) {
    case 'dashed':
      return `${weight * 4},${weight * 2}`
    case 'dotted':
      return `${weight},${weight * 2}`
    case 'dashdot':
      return `${weight * 4},${weight * 1.5},${weight},${weight * 1.5}`
    default:
      return undefined
  }
}

type PropsGeoJSONLayer = {
  data: any
  style?: any
  /** Chamado com as propriedades (atributos) da feição clicada, para exibir
   * um painel/janela com todos os valores. Quando não informado, as formas
   * não capturam clique (o mapa continua arrastável normalmente). */
  onFeatureClick?: (properties: Record<string, any>) => void
}

export const GeoJSONLayer = ({ data, style, onFeatureClick }: PropsGeoJSONLayer) => {
  const ctx = useContext(MapContext)
  if (!ctx || !data || !data.features) return null
  const { project, size, dragMovedRef } = ctx

  const renderGeometry = (
    geom: any,
    featureStyle: any,
    properties: Record<string, any>,
    key: string,
  ) => {
    if (!geom) return null

    // O formulário de cadastro salva a opacidade como `opacity`; aceitamos
    // também `fillOpacity` por compatibilidade com qualquer estilo salvo
    // diretamente nesse formato.
    const opacidade = featureStyle.fillOpacity ?? featureStyle.opacity
    const weight = featureStyle.weight || 2
    const dasharray = dasharrayPara(featureStyle.lineStyle, weight)

    // Handler de clique compartilhado por todos os tipos de geometria.
    // Ignora o clique se o gesto foi na verdade um arrasto do mapa que
    // começou ou terminou em cima desta feição.
    const handleFeatureClick = onFeatureClick
      ? (e: React.MouseEvent) => {
          e.stopPropagation()
          if (dragMovedRef?.current) return
          onFeatureClick(properties)
        }
      : undefined

    // pointer-events só é ligado quando há um handler de clique — assim o
    // arrasto do mapa (por baixo do SVG, que tem pointer-events-none) não é
    // afetado quando ninguém está escutando cliques em feições.
    const eventoClique = handleFeatureClick
      ? { onClick: handleFeatureClick, style: { pointerEvents: 'auto' as const, cursor: 'pointer' } }
      : {}

    if (geom.type === 'LineString' || geom.type === 'MultiLineString') {
      const linhas = geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates
      const d = linhas
        .map((line: any) => {
          const pts = line.map((c: any) => project(c[0], c[1]))
          return 'M' + pts.map((p: any) => `${p[0]},${p[1]}`).join('L')
        })
        .join(' ')
      return (
        <g key={key}>
          <path
            d={d}
            fill="none"
            stroke={featureStyle.color || '#3b82f6'}
            strokeWidth={weight}
            strokeOpacity={opacidade ?? 1}
            strokeDasharray={dasharray}
          />
          {/* Área de clique invisível, mais larga que o traço visível — uma
              linha fina de 2px é quase impossível de acertar no pixel exato. */}
          {handleFeatureClick && (
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(weight + 10, 14)}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={handleFeatureClick}
            />
          )}
        </g>
      )
    }

    if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      const poligonos = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
      const d = poligonos
        .map((poly: any) =>
          poly
            .map((ring: any) => {
              const pts = ring.map((c: any) => project(c[0], c[1]))
              return 'M' + pts.map((p: any) => `${p[0]},${p[1]}`).join('L') + 'Z'
            })
            .join(' '),
        )
        .join(' ')
      return (
        <path
          key={key}
          d={d}
          fill={featureStyle.fillColor || featureStyle.color || '#3b82f6'}
          fillOpacity={opacidade ?? 0.2}
          stroke={featureStyle.color || '#2563eb'}
          strokeWidth={featureStyle.weight || 1}
          strokeDasharray={dasharray}
          {...eventoClique}
        />
      )
    }

    if (geom.type === 'Point' || geom.type === 'MultiPoint') {
      const coordsList = geom.type === 'Point' ? [geom.coordinates] : geom.coordinates
      return (
        <g key={key}>
          {coordsList.map((c: any, i: number) => {
            const [x, y] = project(c[0], c[1])
            const r = featureStyle.radius || 5
            const propsComuns = {
              fill: featureStyle.fillColor || featureStyle.color || '#3b82f6',
              fillOpacity: opacidade ?? 1,
              stroke: featureStyle.color || '#fff',
              strokeWidth: featureStyle.weight || 1,
            }
            const symbolKey = `${key}-${i}`

            let simbolo
            switch (featureStyle.pointSymbol) {
              case 'square':
                simbolo = <rect x={x - r} y={y - r} width={r * 2} height={r * 2} {...propsComuns} />
                break
              case 'triangle':
                simbolo = <polygon points={poligonoRegular(x, y, r, 3)} {...propsComuns} />
                break
              case 'diamond':
                simbolo = <polygon points={poligonoRegular(x, y, r, 4)} {...propsComuns} />
                break
              case 'star':
                simbolo = <polygon points={estrelaPoints(x, y, r)} {...propsComuns} />
                break
              case 'cross':
                simbolo = (
                  <path
                    d={`M${x - r},${y} L${x + r},${y} M${x},${y - r} L${x},${y + r}`}
                    stroke={propsComuns.fill}
                    strokeWidth={Math.max(2, featureStyle.weight || 2)}
                    strokeOpacity={opacidade ?? 1}
                  />
                )
                break
              default:
                simbolo = <circle cx={x} cy={y} r={r} {...propsComuns} />
            }

            return (
              <g key={symbolKey}>
                {simbolo}
                {/* Área de clique invisível, bem maior que o símbolo visual —
                    um ponto de 5px de raio é quase impossível de acertar no
                    pixel exato. O símbolo continua pequeno visualmente. */}
                {handleFeatureClick && (
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(r + 6, 10)}
                    fill="transparent"
                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    onClick={handleFeatureClick}
                  />
                )}
              </g>
            )
          })}
        </g>
      )
    }

    return null
  }

  const elements = data.features.map((f: any, i: number) => {
    return renderGeometry(f.geometry, style || {}, f.properties || {}, `f-${i}`)
  })

  return (
    <svg className="absolute inset-0 pointer-events-none" width={size.width} height={size.height}>
      {elements}
    </svg>
  )
}
