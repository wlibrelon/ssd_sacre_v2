import { supabase } from '@/lib/supabase/client'

export const listFiles = async (bucket: string, folderPath: string) => {
  const { data, error } = await supabase.storage.from(bucket).list(folderPath, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  })
  if (error) {
    console.error(`Error listing files in ${bucket}/${folderPath}:`, error)
    return []
  }
  // supabase list might return empty folder placeholders like '.emptyFolderPlaceholder'
  return data.filter((f) => f.name !== '.emptyFolderPlaceholder')
}

export const uploadFile = async (bucket: string, folderPath: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${folderPath}/${file.name}`, file, { upsert: true })

  if (error) throw error
  return data
}

export const deleteFile = async (bucket: string, filePath: string) => {
  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) throw error
}
