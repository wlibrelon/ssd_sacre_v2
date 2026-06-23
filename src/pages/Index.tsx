import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Building2, BarChart2, ArrowRight } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

// Configuração de cada tabela: nome de exibição + ícone usado no lugar da thumbnail
const FONTES = [
  { tabela: 'artigos', label: 'Artigos', icon: BarChart2 },
  { tabela: 'midia', label: 'Mídia', icon: Activity },
  { tabela: 'congressos', label: 'Congresso', icon: Building2 },
]

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatarData(dataPub) {
  if (!dataPub) return ''

  // Quando o valor vem como 'YYYY-MM-DD' (coluna do tipo date, sem hora),
  // o construtor Date() interpreta isso como meia-noite em UTC. Se usarmos
  // depois getDate()/getMonth()/getFullYear() (que retornam no fuso LOCAL
  // do navegador), em fusos atrás de UTC (como o Brasil) o dia "volta" um
  // dia. Por isso extraímos o ano/mês/dia direto da string, sem passar
  // por conversão de fuso horário.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dataPub)
  if (match) {
    const [, ano, mes, dia] = match
    return `${dia} ${MESES[parseInt(mes, 10) - 1]} ${ano}`
  }

  // Fallback para outros formatos de data/hora
  const d = new Date(dataPub)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

const Index = () => {
  const [atualizacoes, setAtualizacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let ativo = true

    async function buscarAtualizacoes() {
      try {
        setCarregando(true)
        setErro(null)

        const resultados = await Promise.all(
          FONTES.map(({ tabela }) =>
            supabase.from(tabela).select('titulo, data_pub').eq('ativar', true),
          ),
        )

        const erroEncontrado = resultados.find((r) => r.error)
        if (erroEncontrado) throw erroEncontrado.error

        const combinadas = resultados.flatMap((r, i) =>
          (r.data || []).map((item) => ({
            ...item,
            fonte: FONTES[i],
          })),
        )

        // Ordena pelas mais recentes primeiro
        combinadas.sort((a, b) => new Date(b.data_pub) - new Date(a.data_pub))

        if (ativo) setAtualizacoes(combinadas)
      } catch (e) {
        if (ativo) setErro(e.message || 'Erro ao carregar atualizações')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    buscarAtualizacoes()
    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center p-8 text-center text-white">
        {/* Imagem de fundo com overlays */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center object-cover brightness-110"
          style={{
            backgroundImage: `url(${'https://hyacuhtohjuzgvcqzdwe.supabase.co/storage/v1/object/public/imagens_app/image_abertura.png'})`,
          }}
        />
        <div className="absolute inset-0 z-10 bg-primary/40 mix-blend-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        {/* Título MENOR no TOPO (uma linha) */}
        <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-2xl whitespace-nowrap">
          Gestão Hídrica Baseada em Dados
        </h1>
      </section>

      {/* Latest Updates */}
      <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary">Últimas Atualizações</h2>
          <Button variant="link" asChild>
            <Link to="/divulgacao/midia">Ver todas</Link>
          </Button>
        </div>

        {carregando && <p className="text-sm text-muted-foreground">Carregando atualizações...</p>}

        {erro && (
          <p className="text-sm text-destructive">
            Não foi possível carregar as atualizações: {erro}
          </p>
        )}

        {!carregando && !erro && atualizacoes.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma atualização ativa no momento.</p>
        )}

        {!carregando && !erro && atualizacoes.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {atualizacoes.map((item, index) => {
              const Icon = item.fonte.icon
              return (
                <div
                  key={`${item.fonte.tabela}-${index}`}
                  className="flex gap-4 p-4 bg-white rounded-lg shadow-sm"
                >
                  <div className="h-16 w-16 bg-slate-200 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary font-semibold mb-1">
                      {item.fonte.label.toUpperCase()}
                    </p>
                    <h3 className="text-sm font-medium leading-tight">{item.titulo}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Publicado em {formatarData(item.data_pub)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Index
