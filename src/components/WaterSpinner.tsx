import { Droplet } from 'lucide-react'

export const WaterSpinner = ({ text = 'Carregando...' }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        <Droplet className="h-12 w-12 text-secondary animate-bounce absolute top-0 left-0 opacity-50" />
        <Droplet className="h-12 w-12 text-primary animate-pulse relative z-10" />
      </div>
      <span className="text-sm font-medium text-primary tracking-wide animate-pulse">{text}</span>
    </div>
  )
}
