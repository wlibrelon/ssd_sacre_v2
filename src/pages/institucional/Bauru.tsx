import { Card, CardContent } from '@/components/ui/card'

export default function Bauru() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary mb-2">Estudo de Caso: Cidade de Bauru</h1>
      <p className="text-muted-foreground text-lg mb-8">
        A escolha de Bauru como laboratório vivo representa um cenário clássico de desafios hídricos
        no interior paulista.
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p>
            Bauru enfrenta desafios crônicos relacionados à dependência excessiva do Rio Batalha,
            que historicamente sofre com secas prolongadas, e do Aquífero Guarani, cuja exploração
            exige monitoramento rigoroso.
          </p>
          <p>
            O projeto mapeia a infraestrutura existente, as perdas na rede (que chegam a níveis
            preocupantes) e propõe cenários onde a diversificação das fontes e a gestão da demanda
            urbana podem criar um equilíbrio sustentável.
          </p>
        </div>
        <img
          src="https://img.usecurling.com/p/600/400?q=city%20map"
          alt="Mapa Bauru"
          className="rounded-lg shadow-sm w-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h4 className="text-4xl font-bold text-primary">380k</h4>
            <p className="text-sm text-muted-foreground mt-1">Habitantes</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h4 className="text-4xl font-bold text-primary">40%</h4>
            <p className="text-sm text-muted-foreground mt-1">Perdas Físicas</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h4 className="text-4xl font-bold text-primary">2</h4>
            <p className="text-sm text-muted-foreground mt-1">Fontes Principais</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
