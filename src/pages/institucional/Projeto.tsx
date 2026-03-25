import { Card, CardContent } from '@/components/ui/card'

export default function Projeto() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-4">Projeto SACRE</h1>
        <div className="w-20 h-1.5 bg-secondary mb-6 rounded-full" />
        <p className="text-lg text-muted-foreground leading-relaxed">
          O projeto Soluções Integradas de Água para Cidades Resilientes (SACRE) visa desenvolver um
          quadro metodológico e ferramentas tecnológicas para auxiliar na transição para uma gestão
          hídrica urbana mais sustentável.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg border border-border">
        <img
          src="https://img.usecurling.com/p/800/400?q=river%20city"
          alt="Visão geral do projeto"
          className="w-full h-[300px] object-cover"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3 text-primary">Nossa Missão</h3>
            <p className="text-muted-foreground">
              Fornecer dados precisos e modelos de simulação robustos que capacitem gestores
              públicos e companhias de saneamento a antecipar crises hídricas e planejar
              infraestruturas resilientes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3 text-primary">Abordagem</h3>
            <p className="text-muted-foreground">
              Utilizamos a bacia hidrográfica do município de Bauru como um "Living Lab"
              (laboratório vivo), aplicando conceitos de economia circular e Soluções Baseadas na
              Natureza (SbN).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
