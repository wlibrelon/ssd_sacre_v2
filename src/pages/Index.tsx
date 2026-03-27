import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Building2, BarChart2, ArrowRight } from 'lucide-react'

const Index = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      {/*
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight z-20">
          Gestão Hídrica Baseada em Dados
        </h1>

        <div className="w-full max-w-4xl h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden shadow-2xl z-10">
          <img
            src="/image_abertura.png"
            alt="Bauru com rio e logo SACRE"
            className="absolute inset-0 w-full h-full object-cover brightness-110"
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        </div>

        <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl z-20 leading-relaxed">
          Conectando pesquisa científica avançada à tomada de decisão pública para construir cidades
          mais resilientes e sustentáveis.
        </p>
      </section>


      <section className="relative rounded-2xl overflow-hidden min-h-[500px] flex items-center justify-center p-8 text-center text-white">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
          style={{ backgroundImage: 'url(/image_abertura.png)' }}
        />
        <div className="absolute inset-0 z-10 bg-primary/40 mix-blend-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

        <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
          Gestão Hídrica Baseada em Dados
        </h1>

        <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto px-4 text-center drop-shadow-xl leading-relaxed">
          Conectando pesquisa científica avançada à tomada de decisão pública para construir cidades mais resilientes e sustentáveis.
        </p>
      </section>
*/}
      <section className="relative rounded-2xl overflow-hidden min-h-[500px] flex items-center justify-center p-8 text-center text-white">
        {/* Imagem de fundo com overlays */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
          style={{ backgroundImage: 'url(/image_abertura.png)' }}
        />
        <div className="absolute inset-0 z-10 bg-primary/40 mix-blend-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

        {/* Título MENOR no TOPO (uma linha) */}
        <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-2xl whitespace-nowrap">
          Gestão Hídrica Baseada em Dados
        </h1>

        {/* Legenda no RODAPÉ (duas linhas) */}
        <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-base md:text-lg text-blue-100 font-light max-w-xl mx-auto px-4 text-center drop-shadow-xl leading-snug">
          Conectando pesquisa científica avançada à tomada de decisão pública
          <br className="hidden md:block" />
          para construir cidades mais resilientes e sustentáveis.
        </p>
      </section>

      {/* Quick Links - COMENTADO conforme solicitado */}
      {/*
      <section className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow group">
          <CardHeader>
            <Building2 className="h-8 w-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle>Projeto SACRE</CardTitle>
            <CardDescription>Estudo de caso focado na bacia hidrográfica de Bauru.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/institucional/projeto">
                Saiba mais <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow group border-primary/20">
          <CardHeader>
            <Activity className="h-8 w-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle>Suporte a Decisão</CardTitle>
            <CardDescription>Simule cenários futuros de demanda e oferta hídrica.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/ssd/cenarios">
                Acessar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow group">
          <CardHeader>
            <BarChart2 className="h-8 w-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Acesse os dados técnicos e artigos publicados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/resultados/1">
                Explorar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      */}

      {/* Latest Updates */}
      <section className="bg-slate-50 p-8 rounded-xl border border-slate-100">
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
