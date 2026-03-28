import { Card, CardContent } from '@/components/ui/card'

export default function Bauru() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary mb-2">Estudo de Caso: Cidade de Bauru</h1>
      <p className="text-muted-foreground text-lg mb-8">A área de estudo</p>

      <div className="relative rounded-2xl overflow-hidden min-h-[280px] md:min-h-[380px]">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4 md:gap-6 items-start p-4 md:p-6 h-auto">
          {' '}
          {/* Gap/margins reduzidos, cols mais desbalanceadas */}
          {/* COLUNA ESQUERDA: TEXTO COM ESPAÇOS MÍNIMOS */}
          <div className="space-y-1.5 md:space-y-2 text-gray-900">
            {' '}
            {/* Espaçamento ultra-compacto */}
            {/* TÍTULO 1: Margin-bottom mínimo ao texto */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1.5 md:mb-2 leading-tight">
              A área de estudo
            </h3>
            <div className="space-y-1.5 md:space-y-2 leading-relaxed">
              {' '}
              {/* Inner space para parágrafos */}
              <p>
                Localizada nas porções altas das bacias dos rios Batalha e Bauru, compreende parte
                dos municípios de Bauru, Piratininga e Agudos. Esta região está localizada no centro
                do Estado de São Paulo, nas unidades de Gerenciamento dos Recursos Hídricos do
                Tietê-Batalha e Tietê-Jacaré.
              </p>
              <p>
                O principal núcleo urbano e alvo da pesquisa é Bauru, um destacado polo econômico
                regional, com uma população de 380 mil habitantes, e um PIB de R$ 15 bilhões. Outro
                centro é Piratininga, com uma população de 12 mil habitantes e um PIB de R$ 260
                milhões.
              </p>
            </div>
            {/* TÍTULO 2: Margin-top mínimo após texto, mb colado ao conteúdo futuro */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mt-3 md:mt-4 mb-1.5 md:mb-2 leading-tight">
              O problema hídrico da região
            </h3>
            {/* Placeholder para texto do problema - ADICIONE AQUI o conteúdo específico */}
            <p className="text-gray-700 italic">
              /* Insira aqui o texto sobre o problema hídrico */
            </p>
          </div>
          {/* COLUNA DIREITA: IMAGEM QUADRADA MAIOR E OTIMIZADA */}
          <div className="aspect-square md:min-h-[420px] relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white shadow-inner">
            {' '}
            {/* Altura maior, fallback melhor */}
            <img
              src="/imagem_1_bauru.png"
              alt="Mapa da área de estudo: bacias Batalha e Bauru (Bauru-SP)"
              className="absolute inset-0 w-full h-full object-cover brightness-105 rounded-xl" /* IMG nativa > background para perf/acessibilidade */
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-lg mb-8">O problema hídrico da região</p>
      <p>
        Embora o abastecimento público de Bauru venha de uma captação no rio Batalha (13,2 Mm³/ano)
        e de 39 poços tubulares profundos no Sistema Aquífero Guarani (34,6 Mm³/ano) (dados de
        2021), a cidade é uma das mais vulneráveis às estiagens do Estado de São Paulo, com um
        histórico de seguidas crises hídricas. Tal problema provocou a perfuração de mais de 400
        poços tubulares privados no Sistema Aquífero Bauru, que extraem 2,34 Mm³/ano, totalizando
        uma produção de água de 50,14 Mm³/ano para essa cidade. Essa vazão, ainda que fosse
        suficiente para o atendimento de toda a sua demanda, não o é devido a alguns fatores: 50% da
        água distribuída é perdida por fugas da rede e na própria estação de tratamento de água; há
        limitações na operação da rede que não é interligada; a captação do Batalha se faz em uma
        bacia pequena, com alta competição pela água (uso rural) e com sérios problemas no seu
        reservatório; e há regiões onde o Sistema Aquífero Guarani apresenta baixa produção. Assim,
        as razões que explicam as crises hídricas vão além da simples falha no suprimento das fontes
        de água.
      </p>

      <section className="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center p-8 text-center text-white">
        {/* Imagem de fundo com overlays */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
          style={{
            backgroundImage: `url('/imagem_2_bauru.png')`, // Aspas + / explícito
            backgroundSize: '80% auto',
          }}
        />
        <div className="absolute inset-0 z-10 bg-primary/40 mix-blend-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
      </section>

      <p className="text-muted-foreground text-lg mb-8">
        Problemas na sustentabilidade do abastecimento
      </p>
      <p>
        No Sistema Aquífero Guarani: águas subterrâneas de reposição muito lenta (mais de 100 mil
        anos), o que as classificam como fósseis, ou seja, a extração continuada e sem planejamento
        dessas águas poderá levar à exaustão do aquífero, com constante aumento dos custos para sua
        captação.
      </p>
      <p>
        No Sistema Aquífero Bauru, que ocorre sob a cidade e apresenta uma extensa pluma
        contaminante constituída por nitrato e outros compostos até 60 m de profundidade, gerada
        pela fuga da rede de esgoto, o que restringe o uso das águas subterrâneas e coloca em risco
        o usuário privado.
      </p>

      <div className="grid grid-cols-3 gap-4 text-center">
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-primary leading-tight">
              Quantidade de água
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              •Redução de vazões na captação no Rio Batalha em estiagens;
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              •Alto nível de perdas de água no abastecimento de Bauru;
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              •Regiões em Bauru afetadas por falhas de abastecimento (rodízio e solicitações de
              caminhão-pipa);
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              •Aumento das retiradas no Sistema Aquífero Guarani (águas não-renováveis, recarga leva
              mais de 30 mil anos)
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-primary leading-tight">
              Qualidade de água
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              •Contaminação do Sistema Aquífero Bauru por nitrato, metais pesados, hidrocarbonetos e
              solventes clorados, devido a vazamentos na rede de esgoto e outras fontes poluidoras;
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              •Lançamento de esgotos domésticos in natura em rios na área urbana de Bauru;
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              •Assoreamento e eutrofização na parte alta do Rio Batalha
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-none shadow-none">
          <CardContent className="pt-6">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-primary leading-tight">
              Gerenciamento e demais questões
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              •Irregularidade na perfuração de poços particulares: boa parte sem outorga, embora
              haja cadastro do DAE;
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              •Construção de condomínios em loteamentos na região da APA do Rio Batalha.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-1 gap-8 items-center">
        <div className="space-y-4">
          <p className="text-muted-foreground text-lg mb-8">As soluções do SACRE</p>
          <p>
            O município de Bauru oferece “outras águas” ainda pouco exploradas para o abastecimento
            público e privado, que são aquelas que o SACRE está estudando para serem incorporadas ao
            sistema público e privado. No leque de alternativas estão:
          </p>
          <p>• Sistemas de uso do binômio rio-aquífero;</p>
          <p>• Recarga gerenciada de aquíferos;</p>
          <p>
            • Tratamento de águas subterrâneas poluídas com soluções baseadas na natureza e de
            engenharia;{' '}
          </p>
          <p>
            • Instrumentos de melhora da gestão e governança do recurso hídrico, com processos de
            alocação dos recursos hídricos.{' '}
          </p>

          <p className="text-muted-foreground text-lg mb-8">Soluções não apenas para Bauru</p>
          <p>
            Muitos dos problemas de Bauru são também encontrados em outras cidades brasileiras,
            permitindo que as soluções desenvolvidas pelo projeto possam ser transferidas e
            adaptadas a essas localidades. Soluções novas em ciência estão sendo pensadas como
            políticas públicas, aproximando tecnologias à sociedade de forma bastante orgânica. O
            SACRE também avalia os trade-offs, a partir de um profundo entendimento dos vários
            ecossistemas e interesses sociais e econômicos, que mais tragam benefícios ao meio
            ambiente e à sociedade, sobretudo em cenários de limitação dos recursos hídricos e
            pressionados pelas mudanças climáticas globais.
          </p>

          <section className="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center p-8 text-center text-white">
            {/* Imagem de fundo com overlays */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
              style={{
                backgroundImage: `url('/imagem_4_bauru.png')`, // Aspas + / explícito
                backgroundSize: '80% auto',
              }}
            />
            <div className="absolute inset-0 z-10 bg-primary/40 mix-blend-overlay" />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
          </section>
        </div>
      </div>
    </div>
  )
}
