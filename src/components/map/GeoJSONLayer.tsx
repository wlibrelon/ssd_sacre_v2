import { useContext } from 'react'
import { MapContext } from './SimpleMap'

export const GeoJSONLayer = ({ data, style }: { data: any; style?: any }) => {
  const ctx = useContext(MapContext)
  if (!ctx || !data || !data.features) return null
  const { project, size } = ctx

  const renderGeometry = (geom: any, featureStyle: any, key: string) => {
    if (!geom) return null

    if (geom.type === 'LineString') {
      const pts = geom.coordinates.map((c: any) => project(c[0], c[1]))
      const d = 'M' + pts.map((p: any) => `${p[0]},${p[1]}`).join('L')
      return (
        <path
          key={key}
          d={d}
          fill="none"
          stroke={featureStyle.color || '#3b82f6'}
          strokeWidth={featureStyle.weight || 2}
        />
      )
    }

    if (geom.type === 'Polygon') {
      const paths = geom.coordinates.map((ring: any) => {
        const pts = ring.map((c: any) => project(c[0], c[1]))
        return 'M' + pts.map((p: any) => `${p[0]},${p[1]}`).join('L') + 'Z'
      })
      return (
        <path
          key={key}
          d={paths.join(' ')}
          fill={featureStyle.fillColor || featureStyle.color || '#3b82f6'}
          fillOpacity={featureStyle.fillOpacity ?? 0.2}
          stroke={featureStyle.color || '#2563eb'}
          strokeWidth={featureStyle.weight || 1}
        />
      )
    }

    if (geom.type === 'MultiPolygon') {
      const paths = geom.coordinates.map((poly: any) => {
        return poly
          .map((ring: any) => {
            const pts = ring.map((c: any) => project(c[0], c[1]))
            return 'M' + pts.map((p: any) => `${p[0]},${p[1]}`).join('L') + 'Z'
          })
          .join(' ')
      })
      return (
        <path
          key={key}
          d={paths.join(' ')}
          fill={featureStyle.fillColor || featureStyle.color || '#3b82f6'}
          fillOpacity={featureStyle.fillOpacity ?? 0.2}
          stroke={featureStyle.color || '#2563eb'}
          strokeWidth={featureStyle.weight || 1}
        />
      )
    }

    if (geom.type === 'Point') {
      const [x, y] = project(geom.coordinates[0], geom.coordinates[1])
      return (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={featureStyle.radius || 5}
          fill={featureStyle.fillColor || featureStyle.color || '#3b82f6'}
          fillOpacity={featureStyle.fillOpacity ?? 1}
          stroke={featureStyle.color || '#fff'}
          strokeWidth={featureStyle.weight || 1}
        />
      )
    }

    return null
  }

  const elements = data.features.map((f: any, i: number) => {
    return renderGeometry(f.geometry, style || {}, `f-${i}`)
  })

  return (
    <svg className="absolute inset-0 pointer-events-none" width={size.width} height={size.height}>
      {elements}
    </svg>
  )
}
