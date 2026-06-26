import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Check, ChevronsUpDown, Loader2, Users, User, Target, FileText } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

export default function Objetivos() {
  const [wps, setWps] = useState<any[]>([])
  const [selectedWpId, setSelectedWpId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [wpDetails, setWpDetails] = useState<any>(null)
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [colabsMap, setColabsMap] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    const fetchInitialData = async () => {
      const [{ data: wpsData }, { data: colabsData }] = await Promise.all([
        supabase.from('wps').select('*, colaboradores(nome)').order('wp'),
        supabase.from('colaboradores').select('id_colaborador, nome'),
      ])

      if (wpsData) setWps(wpsData)
      if (colabsData) {
        setColabsMap(new Map(colabsData.map((c) => [c.id_colaborador, c.nome])))
      }
      setLoading(false)
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!selectedWpId) {
      setWpDetails(null)
      setCollaborators([])
      setProjects([])
      return
    }

    const fetchWpData = async () => {
      setLoading(true)
      const wp = wps.find((w) => w.id_wp === selectedWpId)
      setWpDetails(wp)

      const [{ data: colabData }, { data: projData }] = await Promise.all([
        supabase.from('lista_colab').select('id_colaborador').eq('id_wp', selectedWpId),
        supabase.from('projetos_wps').select('*').eq('id_wp', selectedWpId),
      ])

      if (colabData) {
        setCollaborators(colabData.map((c) => c.id_colaborador))
      } else {
        setCollaborators([])
      }

      if (projData) {
        setProjects(projData)
      } else {
        setProjects([])
      }

      setLoading(false)
    }

    fetchWpData()
  }, [selectedWpId, wps])

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Objetivos dos Projetos</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um Work Package (WP) para visualizar seus detalhes e projetos associados.
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
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {wpDetails.titulo}
              </CardTitle>
              <CardDescription className="text-base text-foreground mt-4">
                {wpDetails.descricao || 'Sem descrição disponível para este Work Package.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Gerente do WP
                </h4>
                <p className="text-muted-foreground">
                  {wpDetails.colaboradores?.nome || 'Não atribuído'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Equipe Colaboradora
                </h4>
                {collaborators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {collaborators.map((id) => (
                      <Badge key={id} variant="secondary">
                        {colabsMap.get(id) || `Colaborador #${id}`}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum membro cadastrado.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Projetos Associados
            </h2>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {projects.map((projeto) => (
                  <Card key={projeto.id_projeto} className="overflow-hidden">
                    <CardHeader className="bg-muted/10 pb-4 border-b">
                      <CardTitle className="text-xl leading-tight">{projeto.titulo}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-2">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground/80">Autor:</span>
                        {projeto.id_autor
                          ? colabsMap.get(projeto.id_autor) || 'Desconhecido'
                          : 'Não informado'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {projeto.resumo && (
                        <div>
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Resumo
                          </h4>
                          <p className="text-foreground/90 leading-relaxed text-sm">
                            {projeto.resumo}
                          </p>
                        </div>
                      )}
                      {projeto.objetivos && (
                        <div>
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Objetivos
                          </h4>
                          <div className="text-foreground/90 leading-relaxed text-sm whitespace-pre-wrap">
                            {projeto.objetivos}
                          </div>
                        </div>
                      )}
                      {!projeto.resumo && !projeto.objetivos && (
                        <p className="text-muted-foreground text-sm italic">
                          Nenhum detalhe adicional fornecido para este projeto.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-40 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Nenhum projeto associado a este WP
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="bg-muted/50 p-6 rounded-full mb-6">
            <Target className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum WP Selecionado</h3>
          <p className="text-muted-foreground max-w-md">
            Utilize o seletor acima para escolher um Work Package e visualizar seus objetivos e
            projetos relacionados.
          </p>
        </div>
      )}
    </div>
  )
}
