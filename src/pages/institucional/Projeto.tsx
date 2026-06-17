import { Card, CardContent } from '@/components/ui/card'
import { Droplet, Recycle, Users, Sprout, ArrowRight } from 'lucide-react'

export default function Projeto() {
  return (
    <div className="w-full min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in bg-slate-50/50">
      {/* Header Section */}
      <section className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
          Sobre o Projeto
        </div>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Desenvolvendo estratégias híbridas hidroeconômicas para enfrentar crises hídricas e
          garantir o abastecimento sustentável.
        </p>
      </section>

      {/* Hero Image */}
      <section className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] w-full group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{
              backgroundImage: `url(https://hyacuhtohjuzgvcqzdwe.supabase.co/storage/v1/object/public/imagens_app/imagem_1_projeto.png)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full"></div>
        </div>
      </section>

      {/* Main Content & Mission */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column - Main Text */}
        <div className="lg:col-span-7 space-y-8 text-gray-700 text-lg leading-relaxed text-justify">
          <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
            Entre 2013 e 2017, longos períodos de estiagem criaram uma crise no abastecimento de
            água para 48% dos municípios brasileiros, causando graves problemas para a saúde
            pública, economia e ambiente. Soluções tradicionais, baseadas em sistemas centralizados
            de fonte-única de abastecimento, têm-se mostrado ineficazes.
          </p>
          <p>
            Assim, o objetivo central do Projeto SACRE é criar soluções{' '}
            <strong className="text-gray-900 font-semibold">"híbridas hidroeconômicas"</strong> que
            reduzam a vulnerabilidade no abastecimento urbano e rural e tratem as águas
            contaminadas, a partir do uso integrado de métodos clássicos e inovadores.
          </p>
          <p>
            O SACRE é um multiprojeto apoiado em quatro pilares: desenvolvimento tecnológico e
            científico; políticas públicas; formação de recursos humanos; e comunicação. A ideia
            central é que a ciência deva embasar as políticas, ouvindo a sociedade e os governantes.
          </p>
        </div>

        {/* Right Column - Highlight Cards */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white border-0 shadow-xl shadow-primary/5 hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Droplet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
              <p className="text-gray-600 leading-relaxed">
                Fornecer dados precisos e modelos de simulação robustos que capacitem gestores
                públicos a antecipar crises hídricas e planejar infraestruturas resilientes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-0 shadow-xl hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">A Abordagem</h3>
              <p className="text-primary-foreground/90 leading-relaxed">
                Utilizamos a bacia do município de Bauru como um "Living Lab", aplicando conceitos
                de economia circular e Soluções Baseadas na Natureza (SbN).
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Second Image & Methodology */}
      <section className="max-w-7xl mx-auto space-y-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-6 text-gray-700 text-lg leading-relaxed">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Metodologia e Inovação</h2>
            <p>
              O trabalho está fundamentado na modelagem de fluxo de água e transporte reativo de
              contaminantes, acoplando aquíferos e corpos hídricos superficiais; conceitos de
              alocação de recursos hídricos e uso conjuntivo de águas.
            </p>
            <ul className="space-y-4 mt-6">
              {[
                'Tratamento de águas subterrâneas de baixo custo',
                'Recarga gerenciada de aquíferos (MAR)',
                'Sistemas híbridos de captação aquífero-rio',
                'Plataforma digital hidroeconômica (HYMP)',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-square sm:aspect-video md:aspect-square">
              <div
                className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-700"
                style={{
                  backgroundImage: `url(https://hyacuhtohjuzgvcqzdwe.supabase.co/storage/v1/object/public/imagens_app/imagem_2_projeto.png)`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final Info Blocks */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <Users className="w-10 h-10 text-secondary mb-4" />
          <h4 className="text-xl font-bold mb-3">Rede de Parcerias</h4>
          <p className="text-gray-600 text-sm">
            Envolvimento de líderes estaduais, universidades nacionais (USP, UNESP, UNICAMP) e
            internacionais, unindo 41 profissionais altamente qualificados.
          </p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <Recycle className="w-10 h-10 text-secondary mb-4" />
          <h4 className="text-xl font-bold mb-3">Formação Humana</h4>
          <p className="text-gray-600 text-sm">
            Mais de 30 pesquisadores e bolsistas atuando ativamente, além de treinamentos in loco
            para stakeholders locais e Comitês de Bacia.
          </p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <Droplet className="w-10 h-10 text-secondary mb-4" />
          <h4 className="text-xl font-bold mb-3">Letramento Científico</h4>
          <p className="text-gray-600 text-sm">
            Eventos como o Encontro das Águas e HidroGeoDia garantem que as políticas públicas sejam
            construídas junto com a sociedade e stakeholders.
          </p>
        </div>
      </section>
    </div>
  )
}
