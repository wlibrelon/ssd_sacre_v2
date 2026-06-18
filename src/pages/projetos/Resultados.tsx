import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Target,
  FileBox,
  Eye,
  Image as ImageIcon,
  FileText as FileIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Resultados() {
  const [wps, setWps] = useState<any[]>([])
  const [selectedWpId, setSelectedWpId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [wpDetails, setWpDetails] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [projectsMap, setProjectsMap] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: wpsData } = await supabase
        .from('wps')
        .select('*, colaboradores(nome)')
        .order('wp')

      if (wpsData) setWps(wpsData)
      setLoading(false)
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!selectedWpId) {
      setWpDetails(null)
      setResults([])
      return
    }

    const fetchWpData = async () => {
      setLoading(true)
      const wp = wps.find((w) => w.id_wp === selectedWpId)
      setWpDetails(wp)

      const { data: projData } = await supabase
        .from('projetos_wps')
        .select('id_projeto, titulo')
        .eq('id_wp', selectedWpId)

      if (projData && projData.length > 0) {
        const pMap = new Map(projData.map((p) => [p.id_projeto, p.titulo]))
        setProjectsMap(pMap)

        const projectIds = projData.map((p) => p.id_projeto)

        const { data: resData } = await supabase
          .from('arq_resultados')
          .select('*')
          .in('id_projeto', projectIds)

        if (resData) {
          setResults(resData)
        } else {
          setResults([])
        }
      } else {
        setResults([])
        setProjectsMap(new Map())
      }

      setLoading(false)
    }

    fetchWpData()
  }, [selectedWpId, wps])

  const handleOpenResult = async (fileName: string) => {
    const { data } = supabase.storage.from('arquivos_resultados').getPublicUrl(fileName)
    window.open(data.publicUrl, '_blank', 'noopener,noreferrer')
  }

  const getFileIcon = (fileName: string) => {
    if (!fileName) return <FileBox className="h-8 w-8 text-muted-foreground" />
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    if (ext === 'pdf') {
      return <FileIcon className="h-8 w-8 text-red-500" />
    }
    return <FileBox className="h-8 w-8 text-muted-foreground" />
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resultados dos Projetos</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um Work Package (WP) para visualizar e acessar os resultados documentais ou
          imagens vinculados a ele.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedWpId
                ? wps.find((wp) => wp.id_wp === selectedWpId)?.titulo || `WP selecionado`
                : 'Selecione um WP...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar WP..." />
              <CommandList>
                <CommandEmpty>Nenhum WP encontrado.</CommandEmpty>
                <CommandGroup>
                  {wps.map((wp) => (
                    <CommandItem
                      key={wp.id_wp}
                      value={wp.titulo || ''}
                      onSelect={() => {
                        setSelectedWpId(wp.id_wp === selectedWpId ? null : wp.id_wp)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          selectedWpId === wp.id_wp ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">{wp.titulo}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {loading && wps.length > 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : selectedWpId && wpDetails ? (
        <div className="space-y-8 animate-fade-in-up">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {wpDetails.titulo}
              </CardTitle>
              <div className="flex flex-col gap-2 mt-2">
                <CardDescription className="text-base text-foreground">
                  {wpDetails.descricao || 'Sem descrição disponível.'}
                </CardDescription>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  Gerente:{' '}
                  <span className="text-foreground">
                    {wpDetails.colaboradores?.nome || 'Não atribuído'}
                  </span>
                </p>
              </div>
            </CardHeader>
          </Card>

          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileBox className="h-6 w-6 text-primary" />
              Arquivos de Resultados
            </h2>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((resultado) => (
                  <Card
                    key={resultado.id_arq_res}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1 bg-muted p-3 rounded-xl group-hover:bg-primary/10 transition-colors">
                        {getFileIcon(resultado.nome_arq)}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col h-full">
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider truncate">
                            Projeto:{' '}
                            {projectsMap.get(resultado.id_projeto) || `ID #${resultado.id_projeto}`}
                          </p>
                          <h3 className="font-medium text-lg leading-tight mb-2">
                            {resultado.descricao || 'Documento de Resultado'}
                          </h3>
                          {resultado.nome_arq && (
                            <p
                              className="text-sm text-muted-foreground truncate"
                              title={resultado.nome_arq}
                            >
                              Arquivo: {resultado.nome_arq.split('/').pop()}
                            </p>
                          )}
                        </div>
                        <div className="mt-auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleOpenResult(resultado.nome_arq)}
                            disabled={!resultado.nome_arq}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Exibir Resultado
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                  <FileBox className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-foreground">Nenhum resultado encontrado</p>
                  <p className="text-muted-foreground mt-1 max-w-sm">
                    Este Work Package ainda não possui arquivos de resultados vinculados aos seus
                    projetos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="bg-muted/50 p-6 rounded-full mb-6">
            <FileBox className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum WP Selecionado</h3>
          <p className="text-muted-foreground max-w-md">
            Utilize o seletor acima para escolher um Work Package e visualizar os resultados
            disponíveis.
          </p>
        </div>
      )}
    </div>
  )
}
