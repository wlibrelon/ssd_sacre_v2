import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type WpDetail = {
  subtitle: string
  body: string
  metas: string[]
}

const wpDetails: Record<string, WpDetail> = {
  WP1: {
    subtitle: 'Por que o nitrogênio?',
    body: 'Além de sua toxicidade, a contaminação por N fornece um indicador da extensão dos impactos humanos e, devido à sua ocorrência sob muitas formas químicas, também caracteriza as mudanças nas condições geoquímicas ao longo do ciclo hidrológico.',
    metas: [
      'Compreender e quantificar a dinâmica e o impacto do N em aquíferos urbanos e rurais através de estudos detalhados in loco, modelos numéricos de transporte químico-reativo e avaliação integrada de fonte-recarga-transporte-descarga.',
      'Identificar e caracterizar a ocorrência de contaminantes emergentes em urbanizações, correlacionando potenciais ameaças à qualidade das águas subterrâneas com as infraestruturas urbanas e os hábitos culturais.',
      'Desenvolver métodos analíticos e nova técnica de monitoramento de aquíferos para substâncias emergentes associadas a fontes de contaminantes dispersas e multipontuais.',
    ],
  },
  WP2: {
    subtitle: 'Em breve',
    body: 'Conteúdo detalhado do WP2 será disponibilizado em breve.',
    metas: [],
  },
  WP3: {
    subtitle: 'Em breve',
    body: 'Conteúdo detalhado do WP3 será disponibilizado em breve.',
    metas: [],
  },
  WP4: {
    subtitle: 'Em breve',
    body: 'Conteúdo detalhado do WP4 será disponibilizado em breve.',
    metas: [],
  },
  WP5: {
    subtitle: 'Em breve',
    body: 'Conteúdo detalhado do WP5 será disponibilizado em breve.',
    metas: [],
  },
  WP6: {
    subtitle: 'Em breve',
    body: 'Conteúdo detalhado do WP6 será disponibilizado em breve.',
    metas: [],
  },
}

const workPackages = [
  {
    id: 'WP1',
    color: 'border-l-red-500',
    bg: 'bg-red-50',
    title: 'Contaminação por nitrogênio e vulnerabilidade às mudanças climáticas',
    desc: 'Nosso foco: Fontes, destino e transporte de nitrogênio (N) e de outros contaminantes das águas subterrâneas urbanas e rurais.',
  },
  {
    id: 'WP2',
    color: 'border-l-green-500',
    bg: 'bg-green-50',
    title:
      'Soluções baseadas na natureza para incrementar a qualidade e quantidade dos recursos hídricos',
    desc: 'Nosso foco: Análise de serviços ecossistêmicos hídricos em áreas urbanas verdes e avaliação da eficiência de tratamentos usando Soluções Baseadas na Natureza (Nature-based-Solutions: NbS).',
  },
  {
    id: 'WP3',
    color: 'border-l-yellow-500',
    bg: 'bg-yellow-50',
    title: 'Sistema in situ e tratamento da contaminação das águas subterrâneas urbanas',
    desc: 'Nosso foco: Remediação da contaminação de aquíferos resultante de fontes não pontuais ou difusas, que representa hoje um dos maiores desafios na ciência ambiental.',
  },
  {
    id: 'WP4',
    color: 'border-l-blue-500',
    bg: 'bg-blue-50',
    title: 'Uso conjuntivo de múltiplas fontes de água para abastecer a cidade e a agricultura',
    desc: 'Nosso foco: Caracterização hidrodinâmica dos aquíferos e rios, buscando o seu melhor aproveitamento para o abastecimento público e privado e a redução das vulnerabilidades hidroclimáticas em cidades e no campo.',
  },
  {
    id: 'WP5',
    color: 'border-l-purple-500',
    bg: 'bg-purple-50',
    title:
      'Métodos econômicos e políticos para incentivar a gestão sustentável das águas e melhorar a segurança hídrica',
    desc: 'Nosso foco: Conjunto de métodos, ferramentas e instrumentos políticos hidroeconômicos integrados, organizados em uma plataforma (HYMP), para apoiar e incentivar estratégias sustentáveis de uso e gerenciamento da água em um ambiente de incertezas climáticas.',
  },
  {
    id: 'WP6',
    color: 'border-l-amber-800',
    bg: 'bg-amber-50',
    title: 'Investigação de processos do ciclo do nitrogênio em escala de poro',
    desc: 'Nosso foco: Processos hidrobiogeoquímicos que controlam a ocorrência das espécies nitrogenadas em escala de poro e, consequentemente, seu transporte e destino em escala de aquífero.',
  },
]

export default function Objetivos() {
  const [wpLogos, setWpLogos] = useState<Record<string, string>>({})
  const [selectedWp, setSelectedWp] = useState<(typeof workPackages)[0] | null>(null)

  useEffect(() => {
    async function loadLogos() {
      const { data: files, error } = await supabase.storage.from('imagens').list('', {
        limit: 50,
        sortBy: { column: 'name', order: 'asc' },
      })

      if (error) {
        console.error('[Objetivos] Erro ao listar imagens do storage:', error)
        return
      }

      const logos: Record<string, string> = {}
      ;(files ?? [])
        .filter((f) => f.name.toLowerCase().startsWith('logo_wp'))
        .forEach((f) => {
          const match = f.name.match(/logo_wp(\d+)/i)
          if (match) {
            const key = `WP${match[1]}`
            logos[key] = supabase.storage.from('imagens').getPublicUrl(f.name).data.publicUrl
          }
        })

      setWpLogos(logos)
    }

    loadLogos()
  }, [])

  const detail = selectedWp ? wpDetails[selectedWp.id] : null

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-fade-in-up py-12 px-4 sm:px-6">
      {/* Introduction Section */}
      <section className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Objetivos e Estrutura
          </h1>
          <div className="w-20 h-1.5 bg-secondary mb-8 rounded-full" />
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              O projeto SACRE visa criar soluções{' '}
              <strong className="text-primary font-semibold">"híbridas hidroeconômicas"</strong>{' '}
              para reduzir a vulnerabilidade do abastecimento de água e gerenciar de forma
              sustentável os recursos hídricos frente às mudanças climáticas e expansão urbana.
            </p>
            <p>
              Para alcançar estes resultados ambiciosos, nossa equipe atua de forma sistêmica. A
              pesquisa está estruturada em{' '}
              <strong className="text-primary font-semibold">5 Work Packages (WPs)</strong> que se
              interligam e complementam, cobrindo desde a gestão até o letramento da sociedade,
              garantindo que o desenvolvimento científico se converta em políticas públicas
              aplicáveis.
            </p>
          </div>
        </div>
      </section>

      {/* Work Packages Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Work Packages</h2>
          <div className="h-px bg-border flex-1 ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workPackages.map((wp) => (
            <Card
              key={wp.id}
              className={`overflow-hidden border-l-4 ${wp.color} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <CardHeader className={`${wp.bg} pb-6`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-white text-gray-700 shadow-sm">
                    {wp.id}
                  </span>
                  <div className="p-2 bg-white rounded-xl shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    {wpLogos[wp.id] ? (
                      <img
                        src={wpLogos[wp.id]}
                        alt={`Logo ${wp.id}`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          console.warn(`[Objetivos] Falha ao carregar logo_${wp.id.toLowerCase()}`)
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight text-gray-900">{wp.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 leading-relaxed">{wp.desc}</p>
                <button
                  onClick={() => setSelectedWp(wp)}
                  className="mt-6 flex items-center text-sm font-medium text-primary/80 hover:text-primary transition-colors cursor-pointer group/btn"
                >
                  Saiba mais{' '}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Dialog Saiba Mais */}
      <Dialog
        open={!!selectedWp}
        onOpenChange={(open) => {
          if (!open) setSelectedWp(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedWp && detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700`}
                  >
                    {selectedWp.id}
                  </span>
                  {wpLogos[selectedWp.id] && (
                    <img
                      src={wpLogos[selectedWp.id]}
                      alt={`Logo ${selectedWp.id}`}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </div>
                <DialogTitle className="text-xl leading-snug text-gray-900 pr-6">
                  {selectedWp.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* Subtítulo + texto introdutório */}
                <div className={`rounded-xl p-5 ${selectedWp.bg} border-l-4 ${selectedWp.color}`}>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">{detail.subtitle}</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{detail.body}</p>
                </div>

                {/* Metas */}
                {detail.metas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-800">Nossas metas</h3>
                    <ul className="space-y-3">
                      {detail.metas.map((meta, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span>{meta}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
