/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase } from '@/lib/supabase/client'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Monta a URL pública de um arquivo no storage do Supabase (self-hosted),
 * usando o VITE_SUPABASE_URL configurado no build (não hardcoded), para
 * que funcione tanto em dev/local quanto no servidor dedicado.
 */
export function storagePublicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

// Add any other utility functions here
