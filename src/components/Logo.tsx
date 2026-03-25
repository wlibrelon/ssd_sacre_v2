import { cn } from '@/lib/utils'

export const Logo = ({ className = 'h-10 w-auto' }: { className?: string }) => {
  return (
    <img
      src="/logo.png"
      onError={(e) => {
        // Fallback to the real project logo if local file is missing
        e.currentTarget.src = 'https://projetosacre.org/wp-content/uploads/2023/10/logo-sacre-1.png'
      }}
      alt="SACRE Logo"
      className={cn('object-contain', className)}
    />
  )
}
