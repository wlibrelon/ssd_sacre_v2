import { cn } from '@/lib/utils'

export const Logo = ({ className = 'h-10 w-auto' }: { className?: string }) => {
  return (
    <img
      src="https://hyacuhtohjuzgvcqzdwe.supabase.co/storage/v1/object/public/imagens_app/logo-sacre-1.jpg"
      alt="SACRE Logo"
      className={cn('object-contain', className)}
      onError={(e) => console.error('Logo falhou:', e.currentTarget.src)} // Debug sem fallback
    />
  )
}
