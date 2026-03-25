import { Logo } from './Logo'
import { Link } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glassmorphism h-16 flex items-center px-4 justify-between shadow-sm border-b border-border/50">
      <div className="flex items-center gap-4 z-10">
        <SidebarTrigger className="text-primary hover:bg-primary/10 hover:text-primary transition-colors" />
        <Link
          to="/"
          className="flex items-center transition-transform hover:scale-105 active:scale-95"
        >
          <Logo className="h-10 sm:h-12 w-auto" />
        </Link>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
        <h0 className="hidden md:block font-medium text-sm lg:text-base tracking-tight text-primary/90 pointer-events-auto text-center truncate max-w-[80%]">
          Soluções Integradas de Água para Cidades Resilientes...
        </h0>
      </div>

      <div className="w-10 z-10">{/* Spacer to balance the flex layout */}</div>
    </header>
  )
}
