declare module 'shapefile' {
  export function open(
    shp: ArrayBuffer | Uint8Array,
    dbf?: ArrayBuffer | Uint8Array,
    options?: any,
  ): Promise<any>
  export function read(
    shp: ArrayBuffer | Uint8Array,
    dbf?: ArrayBuffer | Uint8Array,
    options?: any,
  ): Promise<any>
}
