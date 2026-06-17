import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type PartnerLogo = {
  name: string
  url: string
}

export default function Parceiros() {
  const [instituicoes, setInstituicoes] = useState<PartnerLogo[]>([])
  const [apoiadores, setApoiadores] = useState<PartnerLogo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Lista todos os arquivos do bucket 'parceiros' (raiz)
        const { data: files, error } = await supabase.storage.from('parceiros').list('', {
          limit: 200,
          sortBy: { column: 'name', order: 'asc' },
        })

        if (error) throw error

        const allFiles = files ?? []

        // Separa por prefixo e ordena pelo número no nome do arquivo
        const instFiles = allFiles
          .filter((f) => f.name.toLowerCase().startsWith('instituicao_'))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

        const apoiFiles = allFiles
          .filter((f) => f.name.toLowerCase().startsWith('apoio_'))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

        const toLogoUrl = (file: { name: string }): PartnerLogo => ({
          name: file.name,
          url: supabase.storage.from('parceiros').getPublicUrl(file.name).data.publicUrl,
        })

        setInstituicoes(instFiles.map(toLogoUrl))
        setApoiadores(apoiFiles.map(toLogoUrl))
      } catch (error) {
        console.error('[Parceiros] Erro ao carregar arquivos do storage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const LogoGrid = ({
    items,
    title,
    desc,
  }: {
    items: PartnerLogo[]
    title: string
    desc: string
  }) => (
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
              key={item.name}
              className="flex items-center justify-center p-6 h-32 hover:shadow-lg transition-all duration-300 border-gray-100 bg-white group cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.name}
                className="max-w-full max-h-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  console.warn('[Parceiros] Falha ao carregar imagem:', item.name)
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </Card>
          ))}
        </div>
      )}
    </section>
  )

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

      {loading ? (
        <div className="space-y-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-24">
          <LogoGrid
            items={instituicoes}
            title="Instituições Consorciadas"
            desc="Universidades e órgãos de pesquisa que formam a base científica e executiva do projeto."
          />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <LogoGrid
            items={apoiadores}
            title="Apoiadores e Financiadores"
            desc="Agências de fomento e parceiros governamentais que viabilizam nossas pesquisas."
          />
        </div>
      )}
    </div>
  )
}
