import { useContext } from 'react'
import { MapContext, lon2x, lat2y } from './SimpleMap'

export const TileLayer = ({ urlTemplate }: { urlTemplate: string }) => {
  const ctx = useContext(MapContext)
  if (!ctx) return null
  const { center, zoom, size } = ctx

  const z = Math.floor(zoom)
  const n = Math.pow(2, z)

  const cx = lon2x(center[0]) * n
  const cy = lat2y(center[1]) * n

  const tx = Math.floor(cx)
  const ty = Math.floor(cy)

  const ox = (cx - tx) * 256
  const oy = (cy - ty) * 256

  const tilesX = Math.ceil(size.width / 256) + 1
  const tilesY = Math.ceil(size.height / 256) + 1

  const tiles = []
  for (let i = -Math.floor(tilesX / 2); i <= Math.ceil(tilesX / 2); i++) {
    for (let j = -Math.floor(tilesY / 2); j <= Math.ceil(tilesY / 2); j++) {
      const ix = tx + i
      const iy = ty + j
      if (ix >= 0 && ix < n && iy >= 0 && iy < n) {
        const tileScale = Math.pow(2, zoom - z)
        const tileSize = 256 * tileScale

        const left = size.width / 2 - ox * tileScale + i * tileSize
        const top = size.height / 2 - oy * tileScale + j * tileSize

        const src = urlTemplate
          .replace('{x}', ix.toString())
          .replace('{y}', iy.toString())
          .replace('{z}', z.toString())

        tiles.push(
          <img
            key={`${z}-${ix}-${iy}`}
            src={src}
            className="absolute select-none pointer-events-none object-cover"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${tileSize}px`,
              height: `${tileSize}px`,
            }}
            alt=""
            loading="lazy"
            crossOrigin="anonymous"
          />,
        )
      }
    }
  }

  return <div className="absolute inset-0 pointer-events-none">{tiles}</div>
}
