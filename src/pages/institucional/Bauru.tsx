import { Card, CardContent } from '@/components/ui/card'

export default function Bauru() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary mb-2">Estudo de Caso: Cidade de Bauru</h1>
      <p className="text-muted-foreground text-lg mb-8">A área de estudo</p>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p>
            Localizada nas porções altas das bacias dos rios Batalha e Bauru, compreende parte dos
            municípios de Bauru, Piratininga e Agudos. Esta região está localizada no centro do
            Estado de São Paulo, nas unidades de Gerenciamento dos Recursos Hídricos do
            Tietê-Batalha e Tietê-Jacaré.
          </p>
          <p>
            O principal núcleo urbano e alvo da pesquisa é Bauru, um destacado polo econômico
            regional, com uma população de 380 mil habitantes, e um PIB de R$ 15 bilhões. Outro
            centro é Piratininga, com uma população de 12 mil habitantes e um PIB de R$ 260 milhões.
          </p>
        </div>
        <img
          className="absolute inset-0 z-0 bg-center bg-no-repeat brightness-110"
          style={{
            backgroundImage: 'url(/imagem_1_bauru.png)',
            backgroundSize: '70% 70%', // Tamanho fixo %: ajusta sem cortar, centraliza. Teste 60%-80%.
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h4 className="text-4xl font-bold text-primary">Quantidade de água</h4>
            <p className="text-sm text-muted-foreground mt-1">
              •Redução de vazões na captação no Rio Batalha em estiagens; •Alto nível de perdas de
              água no abastecimento de Bauru; •Regiões em Bauru afetadas por falhas de abastecimento
              (rodízio e solicitações de caminhão-pipa); •Aumento das retiradas no Sistema Aquífero
              Guarani (águas não-renováveis, recarga leva mais de 30 mil anos)
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h4 className="text-4xl font-bold text-primary">Qualidade de água</h4>
            <p className="text-sm text-muted-foreground mt-1">Perdas Físicas</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h4 className="text-4xl font-bold text-primary">Gerenciamento e demais questões</h4>
            <p className="text-sm text-muted-foreground mt-1">Fontes Principais</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
