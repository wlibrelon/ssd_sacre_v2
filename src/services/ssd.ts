import { supabase } from '@/lib/supabase/client'

export const getTable = async (table: string) => {
  const { data, error } = await supabase.from(table).select('*')
  if (error) console.error(`Error fetching ${table}:`, error)
  return data || []
}

export const insertRow = async (table: string, row: any) => {
  const { error } = await supabase.from(table).insert(row)
  if (error) console.error(`Error inserting into ${table}:`, error)
  return error
}

export const updateRow = async (table: string, idCol: string, id: any, row: any) => {
  const { error } = await supabase.from(table).update(row).eq(idCol, id)
  if (error) console.error(`Error updating ${table}:`, error)
  return error
}

export const deleteRow = async (table: string, idCol: string, id: any) => {
  const { error } = await supabase.from(table).delete().eq(idCol, id)
  if (error) console.error(`Error deleting from ${table}:`, error)
  return error
}
