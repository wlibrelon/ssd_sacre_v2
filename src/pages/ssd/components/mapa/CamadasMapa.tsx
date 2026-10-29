// Componentes de mapa usados na aba "Mapa" da Simulação, sobre o SimpleMap.
import { useContext, useEffect, useRef } from 'react'
import { MapContext, x2lon, y2lat } from '@/components/map/SimpleMap'
import { poligonoRegular, estrelaPoints, dasharrayPara } from '@/components/map/GeoJSONLayer'

/** Imagem do raster (já reprojetada em Web Mercator) posicionada sobre o mapa. */
export function RasterImagemLayer({
  imagem,
  extensaoMerc,
  opacidade,
}: {
  imagem: string
  extensaoMerc: [number, number, number, number]
  opacidade: number
}) {
  const ctx = useContext(MapContext)
  if (!ctx || !imagem) return null
  const [mx0, my0, mx1, my1] = extensaoMerc
  const [left, top] = ctx.project(x2lon(mx0), y2lat(my0))
  const [right, bottom] = ctx.project(x2lon(mx1), y2lat(my1))
  return (
    <img
      src={imagem}
      alt=""
      draggable={false}
      className="absolute pointer-events-none select-none max-w-none"
      style={{
        left,
        top,
        width: right - left,
        height: bottom - top,
        opacity: opacidade,
        imageRendering: 'pixelated',
      }}
    />
  )
}

/** Escuta cliques no mapa (ignorando arrastos) e devolve a posição lon/lat. */
export function CliqueNoMapa({ onClick }: { onClick: (lon: number, lat: number, x: number, y: number) => void }) {
  const ctx = useContext(MapContext)
  const ref = useRef<HTMLSpanElement>(null)
  const ctxRef = useRef(ctx)
  const cbRef = useRef(onClick)
  ctxRef.current = ctx
  cbRef.current = onClick

  useEffect(() => {
    const container = ref.current?.parentElement
    if (!container) return
    const handler = (e: MouseEvent) => {
      const c = ctxRef.current
      if (!c || c.dragMovedRef.current) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const [lon, lat] = c.unproject(x, y)
      cbRef.current(lon, lat, x, y)
    }
    container.addEventListener('click', handler)
    return () => container.removeEventListener('click', handler)
  }, [])

  return <span ref={ref} className="hidden" />
}

/** Ícone de legenda: ponto (com o símbolo escolhido), linha ou polígono. */
export function IconeLegendaMapa({
  tipo,
  color,
  estilo,
}: {
  tipo: 'point' | 'line' | 'polygon'
  color: string
  estilo: any
}) {
  const s = estilo || {}
  if (tipo === 'point') {
    const [cx, cy, r] = [8, 8, 6]
    const p = { fill: color, stroke: '#fff', strokeWidth: 1 }
    let forma
    switch (s.pointSymbol) {
      case 'square':
        forma = <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} {...p} />
        break
      case 'triangle':
        forma = <polygon points={poligonoRegular(cx, cy, r, 3)} {...p} />
        break
      case 'diamond':
        forma = <polygon points={poligonoRegular(cx, cy, r, 4)} {...p} />
        break
      case 'star':
        forma = <polygon points={estrelaPoints(cx, cy, r)} {...p} />
        break
      case 'cross':
        forma = <path d={`M${cx - r},${cy} L${cx + r},${cy} M${cx},${cy - r} L${cx},${cy + r}`} stroke={color} strokeWidth={2} />
        break
      default:
        forma = <circle cx={cx} cy={cy} r={r} {...p} />
    }
    return (
      <svg width={16} height={16} className="shrink-0">
        {forma}
      </svg>
    )
  }
  if (tipo === 'line') {
    return (
      <svg width={20} height={12} className="shrink-0">
        <line x1={0} y1={6} x2={20} y2={6} stroke={color} strokeWidth={2} strokeDasharray={dasharrayPara(s.lineStyle, 2)} />
      </svg>
    )
  }
  return (
    <svg width={16} height={16} className="shrink-0">
      <rect
        x={1}
        y={1}
        width={14}
        height={14}
        fill={color}
        fillOpacity={0.5}
        stroke={s.color || color}
        strokeWidth={1.5}
        strokeDasharray={dasharrayPara(s.lineStyle, 1.5)}
      />
    </svg>
  )
}
