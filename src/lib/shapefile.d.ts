declare module 'shapefile' {
  export interface Geometry {
    type: string
    coordinates: any[]
  }

  export interface Feature {
    type: 'Feature'
    properties: Record<string, any>
    geometry: Geometry
  }

  export interface FeatureCollection {
    type: 'FeatureCollection'
    features: Feature[]
  }

  export interface ShapefileSource {
    read(): Promise<{ done: boolean; value: Feature }>
    cancel(): Promise<void>
  }

  export function open(
    shp: ArrayBuffer | Uint8Array | string | ReadableStream,
    dbf?: ArrayBuffer | Uint8Array | string | ReadableStream,
    options?: { encoding?: string; highWaterMark?: number },
  ): Promise<ShapefileSource>

  export function read(
    shp: ArrayBuffer | Uint8Array | string | ReadableStream,
    dbf?: ArrayBuffer | Uint8Array | string | ReadableStream,
    options?: { encoding?: string; highWaterMark?: number },
  ): Promise<FeatureCollection>
}
