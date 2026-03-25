import { Card, CardContent } from '@/components/ui/card'
import { PlayCircle } from 'lucide-react'

export default function Midia() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary">Mídia e Notícias</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe as reportagens e divulgações do SACRE para a comunidade.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
          >
            <div className="relative h-48 bg-slate-200 overflow-hidden">
              <img
                src={`https://img.usecurling.com/p/400/300?q=news%20water&seed=${i}`}
                alt="News thumb"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {i % 2 === 0 && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-white opacity-80" />
                </div>
              )}
            </div>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                {i % 2 === 0 ? 'Vídeo' : 'Reportagem'}
              </span>
              <h3 className="text-lg font-bold mt-2 leading-tight text-primary group-hover:text-secondary transition-colors">
                Pesquisadores apresentam modelo em seminário local
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                A equipe debateu sobre a importância do uso racional da água em meio à crise
                hídrica...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
