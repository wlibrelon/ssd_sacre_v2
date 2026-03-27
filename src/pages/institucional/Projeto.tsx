import { Card, CardContent } from '@/components/ui/card'

export default function Projeto() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-4">Projeto SACRE</h1>
        <div className="w-20 h-1.5 bg-secondary mb-6 rounded-full" />
        <p className="text-lg text-muted-foreground leading-relaxed">
          Entre 2013 e 2017, longos períodos de estiagem criaram uma crise no abastecimento de água¹
          para 48% dos municípios brasileiros², causando graves problemas para a saúde pública,
          economia e ambiente. Soluções tradicionais, baseadas em sistemas centralizados de
          fonte-única de abastecimento de água, têm-se mostrado ineficazes no Brasil e em países em
          desenvolvimento. Assim, o objetivo central do Projeto SACRE é o de criar soluções
          “híbridas hidroeconômicas”, ou seja, aquelas que reduzam a vulnerabilidade no
          abastecimento urbano e rural e tratem as águas contaminadas, a partir do uso integrado de
          métodos clássicos e inovadores de engenharia, gestão e técnicas baseadas na natureza
          (NE&MS: Nature, Engineering and Management based Solutions). 
          <br O SACRE é um multiprojeto que tratará do desenvolvimento de pesquisas e tecnologias originais por meio de trabalhos
          direto no campo, formação de recursos humanos de alto nível e comunicação social, cujos
          resultados ao final permitirão subsidiar e criar políticas públicas voltadas à gestão de
          recursos hídricos. O projeto é apoiado em quatro pilares: desenvolvimento tecnológico e
          científico; políticas públicas; formação de recursos humanos de alto nível; e comunicação.
          <br
          A ideia central é que a ciência deva embasar as políticas, a partir do treinamento e
          formação de novos profissionais e da comunicação científica e do ouvir a sociedade e os
          governantes. O trabalho está fundamentado na modelagem de fluxo de água e transporte
          reativo de contaminantes, acoplando aquíferos e corpos hídricos superficiais; conceitos de
          alocação de recursos hídricos e uso conjuntivo³ ⁴ de águas superficiais e subterrâneas;
          soluções de tratamento de águas subterrâneas de baixo custo (barreiras reativas, com foco
          no nitrato e contaminantes emergentes); recarga gerenciada de aquíferos (MAR)⁵; e sistemas
          híbridos de captação aquífero-rio (riverbank filtration).
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
