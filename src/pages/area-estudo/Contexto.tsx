import { Card, CardContent } from '@/components/ui/card'

export default function Contexto() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary">Contexto: Cidade de Bauru</h1>
        <div className="w-16 h-1.5 bg-secondary mt-4 rounded-full" />
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-8 space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>
            O município de Bauru, localizado no centro-oeste do Estado de São Paulo, enfrenta
            desafios hídricos significativos devido à sua dependência de fontes mistas de
            abastecimento. A cidade utiliza tanto águas superficiais (principalmente do Rio Batalha)
            quanto poços profundos conectados ao Aquífero Guarani e ao sistema Bauru.
          </p>
          <p>
            Durante os longos períodos de estiagem que afetaram o Brasil na última década, o sistema
            centralizado de abastecimento revelou suas vulnerabilidades, causando problemas para a
            economia local e para a saúde pública.
          </p>
          <p>
            Este cenário faz de Bauru um <strong>"Living Lab" (Laboratório Vivo)</strong> ideal para
            o Projeto SACRE. Ao estudar e modelar as interações entre a demanda urbana, a eficiência
            da infraestrutura física e as disponibilidades naturais, o projeto visa criar e validar
            <em> Soluções Baseadas na Natureza</em> e modelos de engenharia híbridos que podem ser
            replicados em outras cidades brasileiras.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
