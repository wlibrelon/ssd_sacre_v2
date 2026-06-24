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
  onBoundsChange,
  children,
}: {
  defaultCenter?: [number, number]
  defaultZoom?: number
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

  const bbox = useMemo(() => {
    if (size.width === 0) return [0, 0, 0, 0] as [number, number, number, number]
    const [minLon, maxLat] = unproject(0, 0)
    const [maxLon, minLat] = unproject(size.width, size.height)
    return [minLon, minLat, maxLon, maxLat] as [number, number, number, number]
  }, [unproject, size])

  useEffect(() => {
    if (size.width > 0) {
      onBoundsChange?.(bbox, zoom)
    }
  }, [bbox[0], bbox[1], bbox[2], bbox[3], zoom, size.width, onBoundsChange])

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
      <MapContext.Provider value={{ zoom, center, size, scale, project, unproject, bbox }}>
        {size.width > 0 && children}
      </MapContext.Provider>
    </div>
  )
}
