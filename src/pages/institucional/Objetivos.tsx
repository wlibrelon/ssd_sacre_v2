import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Layers, Calculator, Droplets, BookOpen, ChevronRight } from 'lucide-react'

const workPackages = [
  {
    id: 'WP1',
    title: 'Contaminação por nitrogênio e vulnerabilidade às mudanças climáticas',
    icon: <Target className="w-8 h-8 text-blue-500" />,
    color: 'border-l-blue-500',
    bg: 'bg-blue-50',
    desc: 'Nosso foco: Fontes, destino e transporte de nitrogênio (N) e de outros contaminantes das águas subterrâneas urbanas e rurais..',
  },
  {
    id: 'WP2',
    title:
      'Soluções baseadas na natureza para incrementar a qualidade e quantidade dos recursos hídricos',
    icon: <Layers className="w-8 h-8 text-green-500" />,
    color: 'border-l-green-500',
    bg: 'bg-green-50',
    desc: 'Nosso foco: Análise de serviços ecossistêmicos hídricos em áreas urbanas verdes e avaliação da eficiência de tratamentos usando Soluções Baseadas na Natureza (Nature-based-Solutions: NbS).',
  },
  {
    id: 'WP3',
    title: 'Sistema in situ e tratamento da contaminação das águas subterrâneas urbanas',
    icon: <Calculator className="w-8 h-8 text-purple-500" />,
    color: 'border-l-purple-500',
    bg: 'bg-purple-50',
    desc: 'Nosso foco: Remediação da contaminação de aquíferos resultante de fontes não pontuais ou difusas, que representa hoje um dos maiores desafios na ciência ambiental. ',
  },
  {
    id: 'WP4',
    title: 'Uso conjuntivo de múltiplas fontes de água para abastecer a cidade e a agricultura',
    icon: <Droplets className="w-8 h-8 text-cyan-500" />,
    color: 'border-l-cyan-500',
    bg: 'bg-cyan-50',
    desc: 'Nosso foco: Caracterização hidrodinâmica dos aquíferos e rios, buscando o seu melhor aproveitamento para o abastecimento público e privado e a redução das vulnerabilidades hidroclimáticas em cidades e no campo. ',
  },
  {
    id: 'WP5',
    title:
      'Métodos econômicos e políticos para incentivar a gestão sustentável das águas e melhorar a segurança hídrica',
    icon: <BookOpen className="w-8 h-8 text-orange-500" />,
    color: 'border-l-orange-500',
    bg: 'bg-orange-50',
    desc: 'Nosso foco: Conjunto de métodos, ferramentas e instrumentos políticos hidroeconômicos integrados, organizados em uma plataforma (HYMP), para apoiar e incentivar estratégias sustentáveis de uso e gerenciamento da água em um ambiente de incertezas climáticas. ',
  },
  {
    id: 'WP6',
    title: 'Investigação de processos do ciclo do nitrogênio em escala de poro',
    icon: <BookOpen className="w-8 h-8 text-orange-500" />,
    color: 'border-l-orange-500',
    bg: 'bg-orange-50',
    desc: 'Nosso foco: Processos hidrobiogeoquímicos que controlam a ocorrência das espécies nitrogenadas em escala de poro e, consequentemente, seu transporte e destino em escala de aquífero.',
  },
]

export default function Objetivos() {
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
              <strong className="text-primary font-semibold">"híbridas hidroeconômicas"</strong>
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
                    {wp.icon}
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight text-gray-900">{wp.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 leading-relaxed">{wp.desc}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-primary/80 group-hover:text-primary transition-colors cursor-pointer">
                  Saiba mais{' '}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
