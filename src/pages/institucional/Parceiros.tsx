import { Card } from '@/components/ui/card'

// Logos estáticas em public/parceiros/ (versionadas no git — ver
// public/baixar_logos_parceiros.ps1 para baixar/atualizar os arquivos).
// Para adicionar/remover um parceiro: colocar o arquivo em public/parceiros/
// seguindo o padrão de nome (instituicao_NN_*.ext ou apoio_NN_*.ext, o
// número controla a ordem) e adicionar/remover a entrada correspondente
// abaixo, depois fazer o deploy normal (git + docker build).

type PartnerLogo = {
  name: string
  file: string
}

const INSTITUICOES: PartnerLogo[] = [
  { name: 'CNPq', file: 'instituicao_01_cnpq.png' },
  { name: 'FAPESP', file: 'instituicao_02_fapesp.png' },
  { name: 'Capes', file: 'instituicao_03_capes.png' },
  { name: 'CEPAS', file: 'instituicao_04_cepas.png' },
  { name: 'IGC-USP', file: 'instituicao_05_igc-usp.png' },
  { name: 'Poli-USP', file: 'instituicao_06_poli-usp.png' },
  { name: 'USP', file: 'instituicao_07_usp.png' },
  { name: 'Unesp', file: 'instituicao_08_unesp.png' },
  { name: 'Unicamp', file: 'instituicao_09_unicamp.png' },
  { name: 'Unifesp', file: 'instituicao_10_unifesp.png' },
  { name: 'UFSCar', file: 'instituicao_11_ufscar.png' },
  { name: 'DAE Bauru', file: 'instituicao_12_dae-bauru.png' },
  { name: 'SP Águas (DAEE)', file: 'instituicao_13_sp-aguas.png' },
  { name: 'CETESB', file: 'instituicao_14_cetesb.png' },
  { name: 'SEMIL', file: 'instituicao_15_semil.png' },
  { name: 'IPT', file: 'instituicao_16_ipt.png' },
  { name: 'IPA', file: 'instituicao_17_ipa.png' },
  { name: 'Governo do Estado de São Paulo', file: 'instituicao_18_governo-sp.png' },
  { name: 'Universidade de Waterloo', file: 'instituicao_19_waterloo.png' },
  { name: 'Governo do Canadá', file: 'instituicao_20_canada.png' },
  { name: 'Universidade de Hiroshima', file: 'instituicao_21_hiroshima.png' },
]

const APOIADORES: PartnerLogo[] = [
  { name: 'ALS', file: 'apoio_01_als.png' },
  { name: 'Ellu Ambiental', file: 'apoio_02_ellu-ambiental.png' },
  { name: 'Hydrolog', file: 'apoio_03_hydrolog.png' },
  { name: 'Apoiador', file: 'apoio_04_apoiador.jpg' },
]

const LogoGrid = ({ items, title, desc }: { items: PartnerLogo[]; title: string; desc: string }) => (
  <section className="space-y-8">
    <div className="text-center max-w-2xl mx-auto mb-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-muted-foreground">{desc}</p>
    </div>

    {items.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">
        Nenhum parceiro cadastrado nesta categoria.
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
        {items.map((item) => (
          <Card
            key={item.file}
            className="flex items-center justify-center p-6 h-32 hover:shadow-lg transition-all duration-300 border-gray-100 bg-white group cursor-pointer"
          >
            <img
              src={`/parceiros/${item.file}`}
              alt={item.name}
              className="max-w-full max-h-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                console.warn('[Parceiros] Falha ao carregar imagem:', item.file)
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </Card>
        ))}
      </div>
    )}
  </section>
)

export default function Parceiros() {
  return (
    <div className="max-w-7xl mx-auto space-y-20 animate-fade-in-up py-12 px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Nossos Parceiros
        </h1>
        <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          O Projeto SACRE é construído em colaboração com instituições de excelência e conta com o
          suporte de importantes agências de fomento para desenvolver a ciência.
        </p>
      </div>

      <div className="space-y-24">
        <LogoGrid
          items={INSTITUICOES}
          title="Instituições Consorciadas"
          desc="Universidades e órgãos de pesquisa que formam a base científica e executiva do projeto."
        />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <LogoGrid
          items={APOIADORES}
          title="Apoiadores e Financiadores"
          desc="Agências de fomento e parceiros governamentais que viabilizam nossas pesquisas."
        />
      </div>
    </div>
  )
}
