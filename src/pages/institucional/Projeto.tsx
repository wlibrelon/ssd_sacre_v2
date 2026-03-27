import { Card, CardContent } from '@/components/ui/card'

export default function Projeto() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-4">Projeto SACRE</h1>
        <div className="w-20 h-1.5 bg-secondary mb-6 rounded-full" />
        <p className="text-lg text-muted-foreground leading-relaxed text-justify mb-6">
          Entre 2013 e 2017, longos períodos de estiagem criaram uma crise no abastecimento de água¹
          para 48% dos municípios brasileiros², causando graves problemas para a saúde pública,
          economia e ambiente. Soluções tradicionais, baseadas em sistemas centralizados de
          fonte-única de abastecimento de água, têm-se mostrado ineficazes no Brasil e em países em
          desenvolvimento. Assim, o objetivo central do Projeto SACRE é o de criar soluções
          “híbridas hidroeconômicas”, ou seja, aquelas que reduzam a vulnerabilidade no
          abastecimento urbano e rural e tratem as águas contaminadas, a partir do uso integrado de
          métodos clássicos e inovadores de engenharia, gestão e técnicas baseadas na natureza
          (NE&MS: Nature, Engineering and Management based Solutions).
        </p>

        <p className="text-lg text-muted-foreground leading-relaxed text-justify mb-6">
          O SACRE é um multiprojeto que tratará do desenvolvimento de pesquisas e tecnologias
          originais por meio de trabalhos direto no campo, formação de recursos humanos de alto
          nível e comunicação social, cujos resultados ao final permitirão subsidiar e criar
          políticas públicas voltadas à gestão de recursos hídricos. O projeto é apoiado em quatro
          pilares: desenvolvimento tecnológico e científico; políticas públicas; formação de
          recursos humanos de alto nível; e comunicação. A ideia central é que a ciência deva
          embasar as políticas, a partir do treinamento e formação de novos profissionais e da
          comunicação científica e do ouvir a sociedade e os governantes.
        </p>

        <p className="text-lg text-muted-foreground leading-relaxed text-justify">
          O trabalho está fundamentado na modelagem de fluxo de água e transporte reativo de
          contaminantes, acoplando aquíferos e corpos hídricos superficiais; conceitos de alocação
          de recursos hídricos e uso conjuntivo³ ⁴ de águas superficiais e subterrâneas; soluções de
          tratamento de águas subterrâneas de baixo custo (barreiras reativas, com foco no nitrato e
          contaminantes emergentes); recarga gerenciada de aquíferos (MAR)⁵; e sistemas híbridos de
          captação aquífero-rio (riverbank filtration).
        </p>
      </div>

      <div
        className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
        style={{ backgroundImage: 'url(/imagem_1_projeto.png)' }}
      />

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

      <div
        className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
        style={{ backgroundImage: 'url(/imagem_2_projeto.png)' }}
      />

      <div className="w-20 h-1.5 bg-secondary mb-6 rounded-full" />
      <p className="text-lg text-muted-foreground leading-relaxed text-justify mb-6">
        O desenvolvimento de métodos de monitoramento e de remediação de aquíferos contaminados por
        fontes multipontuais e dispersas, com base em NE&MS, proporcionará avanços científicos
        inéditos ao país e poderá gerar tecnologias patenteáveis. Todas as soluções de aumento de
        oferta, tratamento e alocação de águas rurais e urbanas serão avaliadas dentro de um novo
        arranjo administrativo de gestão de recurso hídrico, que levará em conta aspectos
        socioeconômicos, hábitos sociais dos usuários (“produtores públicos e privados de água⁶”) e
        as políticas de uso da terra. As soluções técnicas e de envolvimento institucional serão
        testadas de forma pioneira em um estudo nas cabeceiras das bacias hidrográficas dos rios
        Bauru-Batalha, onde se localizam parte dos municípios de Bauru, Piratininga e Agudos (SP).
      </p>

      <p className="text-lg text-muted-foreground leading-relaxed text-justify mb-6">
        Toda a experiência científica interdisciplinar de ponta nas áreas de hidrogeologia,
        engenharia hidrológica, socioeconomia e governança hídrica, baseada no desenvolvimento e
        adaptação de NE&MS, permitirá criar uma plataforma digital hidroeconômica de múltiplas
        soluções (HYMP: HYdroeconomic, Multiple solutions Platform) que auxiliará na gestão dos
        recursos hídricos adequada às condições biofísicas e socioeconômicas do Estado de São Paulo.
        O Projeto SACRE traz também uma outra novidade, que é o envolvimento das principais
        lideranças institucionais na gestão dos recursos hídricos subterrâneos do Estado de São
        Paulo (IPA, CETESB, IPT, SIMAL, DAEE), consorciadas a universidades nacionais (USP, UNESP,
        UNICAMP e UNIFESP) e estrangeiras (University of Waterloo do Canadá e Hiroshima University
        do Japão), recebendo apoio formal dos governos do Estado de São Paulo, do Canadá e do
        Município de Bauru. No total são 41 profissionais, a maioria com título superior a doutor.
      </p>

      <p className="text-lg text-muted-foreground leading-relaxed text-justify">
        A formação de recursos humanos é outro ponto de destaque do SACRE. Hoje o projeto conta com
        26 alunos e pesquisadores bolsistas e outros 4 não bolsistas, incluindo 1 Jovem Pesquisador;
        2 Pós-Doutorados (PD); 5 Doutorados Direto; 3 Doutorados; 5 Mestrados; 4 Treinamento
        Tecnológicos (TT); 4 Iniciação Científica (IC); e 4 Trabalho de Conclusão de Curso (e ainda
        8 bolsas não ocupadas, incluindo 1 PD, 1 Jornalismo Científico, 3 IC e 3 TT). Cursos e
        treinamento in loco também são desenvolvidos e voltados tanto para a os stakeholders locais
        e estaduais, como de Comitês de Bacia e de organismos nacionais.
      </p>

      <p className="text-lg text-muted-foreground leading-relaxed text-justify">
        A comunicação científica tem papel decisivo no SACRE, pois entende-se que políticas públicas
        são efetivas se construídas em acordo com a sociedade e os seus stakeholders. Como um
        projeto científico, o letramento científico⁷ é fundamental para a sociedade contemporânea,
        sobretudo em temas novos, como as mudanças climáticas globais e soluções baseadas na
        natureza. Por essa razão, o projeto conta em sua equipe com jornalistas e comunicadores
        científicos, além de realizar eventos próprios, como o Encontro das Águas⁸, HidroGeoDia⁹, e
        produtos específicos em mídia digital.
      </p>

      <p className="text-lg text-muted-foreground leading-relaxed text-justify">
        Ao final do Projeto SACRE, um fórum permanente será criado com o propósito de apoiar a
        gestão das águas subterrâneas, através das agências governamentais parceiras. O SACRE conta
        com o financiamento da FAPESP pelo Projeto Temático (2020/15434-0) e de Jovem Pesquisador
        (2021/12817-8); do CNPq pelo Projeto Universal (423950/2021-5); e de bolsas de estudos da
        FAPESP, CAPES, CNPq e da própria USP, superando o montante de 11 milhões de reais.
      </p>
    </div>
  )
}
