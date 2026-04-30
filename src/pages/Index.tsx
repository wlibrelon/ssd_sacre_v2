import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Building2, BarChart2, ArrowRight } from 'lucide-react'

const Index = () => {
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center p-8 text-center text-white">
        {/* Imagem de fundo com overlays */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
          style={{
            backgroundImage:
              'https://hyacuhtohjuzgvcqzdwe.supabase.co/storage/v1/object/public/imagens_app/image_abertura.png',
          }}
        />
        <div className="absolute inset-0 z-10 bg-primary/40 mix-blend-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

        {/* Título MENOR no TOPO (uma linha) */}
        <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-2xl whitespace-nowrap">
          Gestão Hídrica Baseada em Dados
        </h1>
      </section>

      {/* Latest Updates */}
      <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary">Últimas Atualizações</h2>
          <Button variant="link" asChild>
            <Link to="/divulgacao/midia">Ver todas</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="h-16 w-16 bg-slate-200 rounded-md overflow-hidden shrink-0">
              <img
                src="https://img.usecurling.com/p/200/200?q=meeting"
                alt="Thumb"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-secondary font-semibold mb-1">NOVO ARTIGO</p>
              <h3 className="text-sm font-medium leading-tight">
                Análise de vulnerabilidade hídrica urbana no sudeste brasileiro
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Publicado em 12 Out 2025</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="h-16 w-16 bg-slate-200 rounded-md overflow-hidden shrink-0">
              <img
                src="https://img.usecurling.com/p/200/200?q=water%20reservoir"
                alt="Thumb"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-secondary font-semibold mb-1">ATUALIZAÇÃO SSD</p>
              <h3 className="text-sm font-medium leading-tight">
                Novos modelos climáticos integrados ao simulador
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Publicado em 05 Out 2025</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
