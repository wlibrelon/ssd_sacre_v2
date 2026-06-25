import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

export const lon2x = (lon: number) => (lon + 180) / 360
export const lat2y = (lat: number) => {
  const rad = (lat * Math.PI) / 180
  return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2
}
export const x2lon = (x: number) => x * 360 - 180
export const y2lat = (y: number) => {
  const n = Math.PI - 2 * Math.PI * y
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

// Calcula o center/zoom necessários para enquadrar uma extensão
// [minLon, minLat, maxLon, maxLat] dentro do container atual, com uma
// margem de respiro (PADDING). Usada para "zoom to extent" de uma camada.
function calcularViewParaExtensao(
  boundsValue: [number, number, number, number],
  containerWidth: number,
  containerHeight: number,
): { center: [number, number]; zoom: number } {
  const [minLon, minLat, maxLon, maxLat] = boundsValue
  const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2]

  // Container ainda não foi medido (size 0) — usa um zoom neutro; o efeito
  // que chama esta função roda de novo quando o tamanho for conhecido.
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { center, zoom: 10 }
  }

  const PADDING = 0.85 // usa 85% da área disponível, deixando margem nas bordas
  const xRangeNorm = Math.abs(lon2x(maxLon) - lon2x(minLon))
  const yRangeNorm = Math.abs(lat2y(minLat) - lat2y(maxLat))

  // Extensão de um único ponto (ou quase) — não há área para "preencher";
  // usa um zoom alto fixo, em vez de um cálculo que tenderia ao infinito.
  if (xRangeNorm < 1e-9 && yRangeNorm < 1e-9) {
    return { center, zoom: 15 }
  }

  const zoomCandidatos: number[] = []
  if (xRangeNorm > 1e-9) {
    const scaleX = (containerWidth * PADDING) / xRangeNorm
    zoomCandidatos.push(Math.log2(scaleX / 256))
  }
  if (yRangeNorm > 1e-9) {
    const scaleY = (containerHeight * PADDING) / yRangeNorm
    zoomCandidatos.push(Math.log2(scaleY / 256))
  }

  const zoomCalculado = Math.min(...zoomCandidatos)
  const zoom = Math.max(2, Math.min(18, zoomCalculado))

  return { center, zoom }
}

type MapContextType = {
  zoom: number
  center: [number, number]
  size: { width: number; height: number }
  scale: number
  project: (lon: number, lat: number) => [number, number]
  unproject: (px: number, py: number) => [number, number]
  bbox: [number, number, number, number]
}

export const MapContext = React.createContext<MapContextType | null>(null)

export const SimpleMap = ({
  defaultCenter = [-46.6333, -23.5505],
  defaultZoom = 10,
  bounds = null,
  onBoundsChange,
  children,
}: {
  defaultCenter?: [number, number]
  defaultZoom?: number
  /** Extensão [minLon, minLat, maxLon, maxLat] para enquadrar automaticamente.
   * Quando fornecida (ou alterada para um novo valor), o mapa recalcula
   * center/zoom para exibir essa área por completo. Útil para abrir o mapa
   * já ajustado à extensão de uma camada específica. */
  bounds?: [number, number, number, number] | null
  onBoundsChange?: (bbox: number[], zoom: number) => void
  children?: React.ReactNode
}) => {
  const [zoom, setZoom] = useState(defaultZoom)
  const [center, setCenter] = useState<[number, number]>(defaultCenter)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      setSize({ width: entries[0].contentRect.width, height: entries[0].contentRect.height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Reaplica center/zoom sempre que uma nova extensão for fornecida (ou
  // quando o tamanho do container for medido após receber uma extensão
  // antes da primeira medição). boundsKey evita reexecuções desnecessárias
  // causadas por uma nova referência de array com os mesmos valores.
  const boundsKey = bounds ? bounds.join(',') : null
  useEffect(() => {
    if (!bounds) return
    const { center: novoCenter, zoom: novoZoom } = calcularViewParaExtensao(
      bounds,
      size.width,
      size.height,
    )
    setCenter(novoCenter)
    setZoom(novoZoom)
    // boundsKey representa o conteúdo de `bounds`; size.width/height
    // disparam um recálculo quando o container ainda não tinha sido medido.
  }, [boundsKey, size.width, size.height])

  const scale = 256 * Math.pow(2, zoom)

  const project = useCallback(
    (lon: number, lat: number): [number, number] => {
      const x = lon2x(lon) * scale
      const y = lat2y(lat) * scale
      const cx = lon2x(center[0]) * scale
      const cy = lat2y(center[1]) * scale
      return [size.width / 2 + (x - cx), size.height / 2 + (y - cy)]
    },
    [center, scale, size],
  )

  const unproject = useCallback(
    (px: number, py: number): [number, number] => {
      const cx = lon2x(center[0]) * scale
      const cy = lat2y(center[1]) * scale
      const x = cx + (px - size.width / 2)
      const y = cy + (py - size.height / 2)
      return [x2lon(x / scale), y2lat(y / scale)]
    },
    [center, scale, size],
  )

  const bboxAtual = useMemo(() => {
    if (size.width === 0) return [0, 0, 0, 0] as [number, number, number, number]
    const [minLon, maxLat] = unproject(0, 0)
    const [maxLon, minLat] = unproject(size.width, size.height)
    return [minLon, minLat, maxLon, maxLat] as [number, number, number, number]
  }, [unproject, size])

  useEffect(() => {
    if (size.width > 0) {
      onBoundsChange?.(bboxAtual, zoom)
    }
  }, [bboxAtual[0], bboxAtual[1], bboxAtual[2], bboxAtual[3], zoom, size.width, onBoundsChange])

  const isDragging = useRef(false)
  const lastPos = useRef([0, 0])

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    lastPos.current = [e.clientX, e.clientY]
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current[0]
    const dy = e.clientY - lastPos.current[1]
    lastPos.current = [e.clientX, e.clientY]
    const cx = lon2x(center[0]) * scale
    const cy = lat2y(center[1]) * scale
    setCenter([x2lon((cx - dx) / scale), y2lat((cy - dy) / scale)])
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const dz = e.deltaY > 0 ? -0.5 : 0.5
    setZoom((z) => Math.max(0, Math.min(22, z + dz)))
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#e5e7eb] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <MapContext.Provider
        value={{ zoom, center, size, scale, project, unproject, bbox: bboxAtual }}
      >
        {size.width > 0 && children}
      </MapContext.Provider>
    </div>
  )
}
