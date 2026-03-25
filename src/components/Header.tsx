import { Logo } from './Logo'
import { Link } from 'react-router-dom'
import { Droplet } from 'lucide-react'

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glassmorphism h-16 flex items-center px-6 justify-between">
      <Link
        to="/"
        className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
      >
        <Logo className="h-10" />
      </Link>

      <div className="hidden md:flex items-center gap-3 text-primary">
        <div className="h-8 w-[2px] bg-border mr-2" />
        <Droplet className="h-5 w-5 text-secondary" />
        <h1 className="font-medium text-sm lg:text-base tracking-tight text-primary/80">
          Soluções Integradas de Água para Cidades Resilientes
        </h1>
      </div>
    </header>
  )
}
