import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Droplets, KeyRound, Search, Copy, Download, Info, Loader2 } from 'lucide-react'

// A chamada real à API HidroWebService (ANA) é feita pela Edge Function
// "hidro-proxy" (supabase/functions/hidro-proxy/index.ts), evitando o bloqueio
// de CORS que ocorre ao chamar www.ana.gov.br diretamente do navegador.
const HIDRO_PROXY_FN = 'hidro-proxy'

const TIPO_FILTRO_DATA = ['DATA_LEITURA', 'DATA_ULTIMA_ATUALIZACAO']

const RANGE_INTERVALO = [
  'MINUTO_5',
  'MINUTO_10',
  'MINUTO_15',
  'MINUTO_30',
  'HORA_1',
  'HORA_2',
  'HORA_3',
  'HORA_4',
  'HORA_5',
  'HORA_6',
  'HORA_7',
  'HORA_8',
  'HORA_9',
  'HORA_10',
  'HORA_11',
  'HORA_12',
  'HORA_13',
  'HORA_14',
  'HORA_15',
  'HORA_16',
  'HORA_17',
  'HORA_18',
  'HORA_19',
  'HORA_20',
  'HORA_21',
  'HORA_22',
  'HORA_23',
  'HORA_24',
  'DIAS_2',
  'DIAS_7',
  'DIAS_14',
  'DIAS_21',
  'DIAS_30',
]

const UNIDADES_FEDERATIVAS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

// Rotas GET documentadas no manual (seção 2.2), para a consulta livre/avançada.
const ROTAS_DISPONIVEIS = [
  { path: '/OAUthPermissoes/v1', label: 'OAUthPermissoes — permissões via accesstoken SSO' },
  { path: '/HidrosatSerieDados/v1', label: 'HidrosatSerieDados — séries das estações virtuais (HidroSat)' },
  { path: '/HidrosatInventarioEstacoes/v1', label: 'HidrosatInventarioEstacoes — inventário de estações virtuais' },
  { path: '/HidroinfoanaSerieTelemetricaDetalhada/v1', label: 'SerieTelemetricaDetalhada — série + dados brutos' },
  { path: '/HidroinfoanaSerieTelemetricaAdotada/v1', label: 'SerieTelemetricaAdotada — chuva/nível/vazão adotados' },
  { path: '/HidroUF/v1', label: 'HidroUF — lista de unidades federativas' },
  { path: '/HidroSubBacia/v1', label: 'HidroSubBacia — lista de sub-bacias' },
  { path: '/HidroSerieVazao/v1', label: 'HidroSerieVazao — vazão (coleta manual)' },
  { path: '/HidroSerieSedimentos/v1', label: 'HidroSerieSedimentos — sedimentos (coleta manual)' },
  { path: '/HidroSerieResumoDescarga/v1', label: 'HidroSerieResumoDescarga — descarga líquida' },
  { path: '/HidroSerieQA/v1', label: 'HidroSerieQA — qualidade da água' },
  { path: '/HidroSeriePerfilTransversal/v1', label: 'HidroSeriePerfilTransversal — perfil transversal' },
  { path: '/HidroSerieCurvaDescarga/v1', label: 'HidroSerieCurvaDescarga — curvas de descarga' },
  { path: '/HidroSerieCotas/v1', label: 'HidroSerieCotas — cotas (coleta manual)' },
  { path: '/HidroSerieChuva/v1', label: 'HidroSerieChuva — chuva (coleta manual)' },
  { path: '/HidroRio/v1', label: 'HidroRio — corpos hídricos cadastrados' },
  { path: '/HidroMunicipio/v1', label: 'HidroMunicipio — municípios cadastrados' },
  { path: '/HidroInventarioEstacoes/v1', label: 'HidroInventarioEstacoes — inventário completo de estações' },
  { path: '/HidroEntidade/v1', label: 'HidroEntidade — entidades responsáveis/operadoras' },
  { path: '/HidroBacia/v1', label: 'HidroBacia — lista de bacias hidrográficas' },
]

interface RespostaConsulta {
  status: number | string
  data: any
  ok: boolean
}

// Extrai a mensagem real de um erro de invocação da Edge Function. Quando a
// function responde com um status HTTP não-2xx de verdade (ex: 404 porque
// ela não foi implantada, ou 500 por exceção não tratada), o supabase-js
// devolve um FunctionsHttpError cujo corpo original fica em `error.context`.
async function readFunctionError(error: any): Promise<string | null> {
  try {
    if (error?.context?.json) {
      const body = await error.context.json()
      return body?.error || body?.message || JSON.stringify(body)
    }
    if (error?.context?.text) {
      return await error.context.text()
    }
  } catch {
    // ignora — cai no fallback abaixo
  }
  return error?.message ?? null
}

export default function TesteApiHidro() {
  const { isAuthenticated, profile, loading } = useAuth()

  // Autenticação
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [autenticando, setAutenticando] = useState(false)
  const [token, setToken] = useState('')
  const [tokenValidade, setTokenValidade] = useState<string | null>(null)

  // Consulta rápida — Série Telemétrica Adotada
  const [codigoEstacao, setCodigoEstacao] = useState('')
  const [tipoFiltroData, setTipoFiltroData] = useState('DATA_LEITURA')
  const [dataBusca, setDataBusca] = useState('')
  const [rangeIntervalo, setRangeIntervalo] = useState('DIAS_7')

  // Consulta rápida — Inventário de Estações
  const [invCodigoEstacao, setInvCodigoEstacao] = useState('')
  const [invUF, setInvUF] = useState('')
  const [invCodigoBacia, setInvCodigoBacia] = useState('')

  // Consulta livre/avançada
  const [rotaLivre, setRotaLivre] = useState(ROTAS_DISPONIVEIS[4].path)
  const [queryLivre, setQueryLivre] = useState('')

  // Resposta
  const [consultando, setConsultando] = useState(false)
  const [resposta, setResposta] = useState<RespostaConsulta | null>(null)

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const autenticar = async () => {
    if (!identificador || !senha) {
      toast.error('Preencha Identificador (CPF/CNPJ) e Senha.')
      return
    }
    setAutenticando(true)
    setResposta(null)
    try {
      const { data: payload, error } = await supabase.functions.invoke(HIDRO_PROXY_FN, {
        body: { action: 'auth', identificador, senha },
      })
      if (error) {
        // Falha de transporte real (function não implantada, timeout, etc.)
        const details = await readFunctionError(error)
        toast.error(details || `Não foi possível chamar a Edge Function "${HIDRO_PROXY_FN}".`)
        setResposta({ status: 'network-error', data: { error: details }, ok: false })
        return
      }
      const upstreamStatus = payload?.upstreamStatus
      const data = payload?.data
      const success = upstreamStatus >= 200 && upstreamStatus < 300 && data?.items?.tokenautenticacao
      if (success) {
        setToken(data.items.tokenautenticacao)
        setTokenValidade(data.items.validade ?? null)
        toast.success('Token obtido com sucesso. Válido por 60 minutos.')
      } else {
        setToken('')
        setTokenValidade(null)
        toast.error(data?.message || data?.error || `Falha na autenticação (HTTP ${upstreamStatus}).`)
      }
      setResposta({ status: upstreamStatus, data, ok: !!success })
    } catch (err: any) {
      toast.error(
        `Erro ao chamar a Edge Function "${HIDRO_PROXY_FN}". Verifique se ela foi implantada (supabase functions deploy ${HIDRO_PROXY_FN}).`,
      )
      setResposta({ status: 'network-error', data: { error: err?.message }, ok: false })
    } finally {
      setAutenticando(false)
    }
  }

  const executarFetch = async (path: string, params: Record<string, string>) => {
    if (!token) {
      toast.error('Obtenha um token de autenticação primeiro.')
      return
    }
    setConsultando(true)
    setResposta(null)
    try {
      const { data: payload, error } = await supabase.functions.invoke(HIDRO_PROXY_FN, {
        body: { action: 'query', token, path, params },
      })
      if (error) {
        const details = await readFunctionError(error)
        toast.error(details || `Não foi possível chamar a Edge Function "${HIDRO_PROXY_FN}".`)
        setResposta({ status: 'network-error', data: { error: details }, ok: false })
        return
      }
      const upstreamStatus = payload?.upstreamStatus
      const data = payload?.data
      const success = upstreamStatus >= 200 && upstreamStatus < 300
      setResposta({ status: upstreamStatus, data, ok: success })
      if (!success) toast.error(data?.message || data?.error || `Erro na consulta (HTTP ${upstreamStatus}).`)
      else toast.success('Consulta realizada com sucesso.')
    } catch (err: any) {
      toast.error(
        `Erro ao chamar a Edge Function "${HIDRO_PROXY_FN}". Verifique se ela foi implantada (supabase functions deploy ${HIDRO_PROXY_FN}).`,
      )
      setResposta({ status: 'network-error', data: { error: err?.message }, ok: false })
    } finally {
      setConsultando(false)
    }
  }

  const consultarSerieAdotada = () => {
    if (!codigoEstacao || !dataBusca) {
      toast.error('Informe Código da Estação e Data de Busca.')
      return
    }
    executarFetch('/HidroinfoanaSerieTelemetricaAdotada/v1', {
      CodigoDaEstacao: codigoEstacao,
      TipoFiltroData: tipoFiltroData,
      DataBusca: dataBusca,
      RangeIntervaloDeBusca: rangeIntervalo,
    })
  }

  const consultarInventario = () => {
    if (!invCodigoEstacao && !invUF && !invCodigoBacia) {
      toast.error('Informe ao menos um filtro: Código da Estação, UF ou Código da Bacia.')
      return
    }
    executarFetch('/HidroInventarioEstacoes/v1', {
      CodigoDaEstacao: invCodigoEstacao,
      UnidadeFederativa: invUF,
      CodigoDaBacia: invCodigoBacia,
    })
  }

  const consultarLivre = () => {
    executarFetch(rotaLivre, Object.fromEntries(new URLSearchParams(queryLivre)))
  }

  const copiarResposta = () => {
    if (!resposta) return
    navigator.clipboard.writeText(JSON.stringify(resposta.data, null, 2))
    toast.success('Resposta copiada.')
  }

  const baixarResposta = () => {
    if (!resposta) return
    const blob = new Blob([JSON.stringify(resposta.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hidrowebservice-resposta.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Droplets className="h-7 w-7" /> Teste API HidroWebService (ANA)
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Autenticado como: <strong className="text-secondary">{profile?.nome}</strong>
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sobre esta página</AlertTitle>
        <AlertDescription>
          Ambiente de teste manual para validar o acesso à API HidroWebService da ANA antes de
          integrarmos os dados ao SACRE. O acesso automatizado exige cadastro prévio via e-mail
          para <strong>hidro@ana.gov.br</strong> (CPF/CNPJ, e-mail e instituição). O token gerado
          é válido por <strong>60 minutos</strong>; evite requisições de autenticação em alta
          frequência, pois podem causar bloqueio automático de IP. As chamadas passam pela Edge
          Function <strong>hidro-proxy</strong> (necessário implantá-la com{' '}
          <code>supabase functions deploy hidro-proxy</code>) para evitar bloqueio de CORS.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> 1. Autenticação
          </CardTitle>
          <CardDescription>
            Informe as credenciais fornecidas pela ANA para obter o token de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identificador">Identificador (CPF/CNPJ)</Label>
              <Input
                id="identificador"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Identificador"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={autenticar} disabled={autenticando}>
              {autenticando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Obter Token
            </Button>
            {token ? (
              <Badge className="bg-green-600 hover:bg-green-600">
                Token ativo{tokenValidade ? ` — válido até ${tokenValidade}` : ''}
              </Badge>
            ) : (
              <Badge variant="outline">Sem token</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> 2. Consultas de Teste
          </CardTitle>
          <CardDescription>
            Use as consultas rápidas (rotas mais comuns) ou monte uma consulta livre para
            qualquer rota documentada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="serie" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-2 mb-6">
              <TabsTrigger value="serie">Série Telemétrica Adotada</TabsTrigger>
              <TabsTrigger value="inventario">Inventário de Estações</TabsTrigger>
              <TabsTrigger value="livre">Consulta Livre</TabsTrigger>
            </TabsList>

            <TabsContent value="serie" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código da Estação *</Label>
                  <Input
                    value={codigoEstacao}
                    onChange={(e) => setCodigoEstacao(e.target.value)}
                    placeholder="Ex: 15400000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Filtro Data *</Label>
                  <Select value={tipoFiltroData} onValueChange={setTipoFiltroData}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_FILTRO_DATA.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Busca (yyyy-MM-dd) *</Label>
                  <Input
                    type="date"
                    value={dataBusca}
                    onChange={(e) => setDataBusca(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Range Intervalo de Busca *</Label>
                  <Select value={rangeIntervalo} onValueChange={setRangeIntervalo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RANGE_INTERVALO.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={consultarSerieAdotada} disabled={consultando}>
                {consultando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Executar Consulta
              </Button>
            </TabsContent>

            <TabsContent value="inventario" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Informe ao menos um filtro: Código da Estação, UF ou Código da Bacia.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Código da Estação</Label>
                  <Input
                    value={invCodigoEstacao}
                    onChange={(e) => setInvCodigoEstacao(e.target.value)}
                    placeholder="Ex: 15400000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade Federativa</Label>
                  <Select value={invUF} onValueChange={setInvUF}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_FEDERATIVAS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Código da Bacia</Label>
                  <Input
                    value={invCodigoBacia}
                    onChange={(e) => setInvCodigoBacia(e.target.value)}
                    placeholder="Ex: 1"
                  />
                </div>
              </div>
              <Button onClick={consultarInventario} disabled={consultando}>
                {consultando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Executar Consulta
              </Button>
            </TabsContent>

            <TabsContent value="livre" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escolha qualquer rota documentada no manual e informe os parâmetros como
                query string (ex: <code>CodigoDaEstacao=15400000&TipoFiltroData=DATA_LEITURA</code>
                ), conforme os nomes de campo exibidos no Swagger.
              </p>
              <div className="space-y-2">
                <Label>Rota</Label>
                <Select value={rotaLivre} onValueChange={setRotaLivre}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROTAS_DISPONIVEIS.map((r) => (
                      <SelectItem key={r.path} value={r.path}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Query string (parâmetros)</Label>
                <Input
                  value={queryLivre}
                  onChange={(e) => setQueryLivre(e.target.value)}
                  placeholder="CodigoDaEstacao=15400000&TipoFiltroData=DATA_LEITURA"
                />
              </div>
              <Button onClick={consultarLivre} disabled={consultando}>
                {consultando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Executar Consulta
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {resposta && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>3. Resposta</CardTitle>
              <CardDescription>
                Status:{' '}
                <Badge variant={resposta.ok ? 'default' : 'destructive'}>{resposta.status}</Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copiarResposta}>
                <Copy className="h-4 w-4 mr-1" /> Copiar
              </Button>
              <Button size="sm" variant="outline" onClick={baixarResposta}>
                <Download className="h-4 w-4 mr-1" /> Baixar JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-md p-4 text-xs overflow-auto max-h-[500px]">
              {JSON.stringify(resposta.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
