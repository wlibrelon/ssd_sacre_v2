import { useState, useEffect } from 'react'
import { getTable, insertRow, deleteRow } from '@/services/ssd'
import { CrudTable } from './CrudTable'
import { useSsdData } from '@/hooks/use-ssd-data'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NativeSelect } from './NativeSelect'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { FilePickerModal } from './FilePickerModal'
import { useToast } from '@/hooks/use-toast'

export function Grupo3() {
  const { toast } = useToast()
  const { fonte_agua, tipos_cenarios, cenarios, acoes, simulacao_ssd } = useSsdData()
  const [activeSim, setActiveSim] = useState('')
  const [cs, setCs] = useState<any[]>([])
  const [cf, setCf] = useState<any[]>([])
  const [af, setAf] = useState<any[]>([])
  const [tcc, setTcc] = useState<any[]>([])
  const [form, setForm] = useState<any>({})

  const loadAll = async () => {
    setCs(await getTable('cenario_simulacao'))
    setCf(await getTable('cenarios_fonte'))
    setAf(await getTable('acoes_fonte'))
    setTcc(await getTable('tipo_cenario_cenario'))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleAdd = async () => {
    if (!activeSim) return alert('Selecione uma simulação ativa!')
    await insertRow('cenario_simulacao', { ...form, id_s: activeSim })
    loadAll()
  }

  const getF = (id: any) => fonte_agua.find((x: any) => x.id_fonte === id)?.nome_fonte
  const getTc = (id: any) => tipos_cenarios.find((x: any) => x.id_tc === id)?.descricao
  const getC = (id: any) => cenarios.find((x: any) => x.id_cenarios === id)?.cenarios
  const getAcao = (id: any) => acoes.find((x: any) => x.id_acao === id)?.descricao

  // Indicators Section
  const [selectedSim, setSelectedSim] = useState<number | null>(null)
  const [indicadores, setIndicadores] = useState<any[]>([])
  const [indicadoresAplicado, setIndicadoresAplicado] = useState<any[]>([])
  const [idIndicador, setIdIndicador] = useState('')
  const [arquivoInd, setArquivoInd] = useState('')
  const [indPickerOpen, setIndPickerOpen] = useState(false)

  const loadIndicadores = async () => setIndicadores(await getTable('indicadores'))

  const loadIndicadoresAplicado = async () => {
    if (!selectedSim) return setIndicadoresAplicado([])
    const { data } = await supabase.from('indicadores_aplicado').select('*').eq('id_s', selectedSim)
    setIndicadoresAplicado(data || [])
  }

  useEffect(() => {
    loadIndicadores()
  }, [])
  useEffect(() => {
    loadIndicadoresAplicado()
  }, [selectedSim])

  const handleIncludeIndicador = async () => {
    if (!selectedSim)
      return toast({ title: 'Selecione uma simulação primeiro', variant: 'destructive' })
    if (!idIndicador || !arquivoInd)
      return toast({ title: 'Preencha o indicador e selecione o arquivo', variant: 'destructive' })

    await insertRow('indicadores_aplicado', {
      id_s: selectedSim,
      id_indicador: parseInt(idIndicador),
      arquivo: arquivoInd,
    })
    setIdIndicador('')
    setArquivoInd('')
    loadIndicadoresAplicado()
  }

  const handleDeleteIndicador = async (id: number) => {
    await deleteRow('indicadores_aplicado', 'id_ia', id)
    loadIndicadoresAplicado()
  }

  const getIndicadorDesc = (id: number) =>
    indicadores.find((i) => i.id_indicador === id)?.descricao || id

  return (
    <div className="space-y-6">
      <CrudTable
        table="simulacao_ssd"
        title="Simulações (clique para selecionar)"
        pk="id_s"
        onSelect={setSelectedSim}
        selectedId={selectedSim}
        cols={[
          { key: 'descricao', label: 'Descrição da Simulação' },
          { key: 'pop_inicial', label: 'População Inicial' },
          { key: 'inicio_perdas', label: 'Início Perdas (AAAA-MM)' },
          { key: 'perc_inicial_perdas', label: '% Inicial Perdas' },
          { key: 'demanda_auto', label: 'Demanda Auto' },
          { key: 'perdas_auto', label: 'Perdas Auto' },
        ]}
      />

      <div className="bg-white p-4 shadow rounded border space-y-4">
        <h3 className="font-semibold text-lg">Configuração de cenários para simulação do SSD</h3>
        <NativeSelect
          options={simulacao_ssd.map((s: any) => ({ value: s.id_s, label: s.descricao }))}
          value={activeSim}
          onChange={setActiveSim}
          placeholder="Selecione a Simulação Ativa"
        />

        {activeSim && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end mt-4">
              <NativeSelect
                options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
                value={form.id_fonte || ''}
                onChange={(v: any) =>
                  setForm({ ...form, id_fonte: v, id_tc: '', id_c: '', id_acao: '' })
                }
                placeholder="Fonte"
              />
              <NativeSelect
                options={tipos_cenarios
                  .filter(
                    (o: any) =>
                      !form.id_fonte ||
                      cf.some((x) => x.id_fonte == form.id_fonte && x.id_tc == o.id_tc),
                  )
                  .map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
                value={form.id_tc || ''}
                onChange={(v: any) => setForm({ ...form, id_tc: v, id_c: '' })}
                placeholder="Tipo Cenário"
              />
              <NativeSelect
                options={cenarios
                  .filter(
                    (o: any) =>
                      !form.id_tc ||
                      tcc.some((x) => x.id_tc == form.id_tc && x.id_c == o.id_cenarios),
                  )
                  .map((o: any) => ({ value: o.id_cenarios, label: o.cenarios }))}
                value={form.id_c || ''}
                onChange={(v: any) => setForm({ ...form, id_c: v })}
                placeholder="Cenário"
              />
              <NativeSelect
                options={acoes
                  .filter(
                    (o: any) =>
                      !form.id_fonte ||
                      af.some((x) => x.id_fonte == form.id_fonte && x.id_acao == o.id_acao),
                  )
                  .map((o: any) => ({
                    value: o.id_acao,
                    label: o.descricao,
                  }))}
                value={form.id_acao || ''}
                onChange={(v: any) => setForm({ ...form, id_acao: v })}
                placeholder="Ação"
              />
              <Button onClick={handleAdd}>Associar</Button>
            </div>

            <div className="overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-2">Fonte</TableHead>
                    <TableHead className="py-2">Tipo</TableHead>
                    <TableHead className="py-2">Cenário</TableHead>
                    <TableHead className="py-2">Ação</TableHead>
                    <TableHead className="py-2 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cs
                    .filter((r) => r.id_s.toString() === activeSim.toString())
                    .map((row) => (
                      <TableRow key={row.id_cs}>
                        <TableCell className="py-1 text-sm">{getF(row.id_fonte)}</TableCell>
                        <TableCell className="py-1 text-sm">{getTc(row.id_tc)}</TableCell>
                        <TableCell className="py-1 text-sm">{getC(row.id_c)}</TableCell>
                        <TableCell className="py-1 text-sm">{getAcao(row.id_acao)}</TableCell>
                        <TableCell className="py-1 text-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={async () => {
                              await deleteRow('cenario_simulacao', 'id_cs', row.id_cs)
                              loadAll()
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {selectedSim && (
        <div className="bg-white p-4 shadow rounded border space-y-4 animate-fade-in">
          <h3 className="font-semibold text-lg">Indicadores aplicados na simulação selecionada</h3>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-semibold mb-1 block">Indicador</label>
              <NativeSelect
                options={indicadores.map((i) => ({ value: i.id_indicador, label: i.descricao }))}
                value={idIndicador}
                onChange={setIdIndicador}
                placeholder="Selecione um indicador..."
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-semibold mb-1 block">Arquivo de Dados (.csv)</label>
              <div className="flex gap-2 items-center w-full">
                <Button
                  variant="outline"
                  onClick={() => setIndPickerOpen(true)}
                  className="flex-1 truncate max-w-[250px]"
                >
                  {arquivoInd || 'Selecionar arquivo'}
                </Button>
                {arquivoInd && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setArquivoInd('')}
                    title="Limpar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
            <Button onClick={handleIncludeIndicador} className="w-full md:w-auto">
              Incluir indicador
            </Button>
          </div>

          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2">Indicador</TableHead>
                  <TableHead className="py-2">Arquivo</TableHead>
                  <TableHead className="py-2 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicadoresAplicado.map((row) => (
                  <TableRow key={row.id_ia}>
                    <TableCell className="py-1 text-sm">
                      {getIndicadorDesc(row.id_indicador)}
                    </TableCell>
                    <TableCell className="py-1 text-sm">{row.arquivo}</TableCell>
                    <TableCell className="py-1 text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteIndicador(row.id_ia)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {indicadoresAplicado.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-4 text-center text-muted-foreground text-sm"
                    >
                      Nenhum indicador vinculado a esta simulação.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <FilePickerModal
        open={indPickerOpen}
        onOpenChange={setIndPickerOpen}
        bucket="dados_brutos"
        folder="indicadores"
        onSelect={(fileName) => {
          setArquivoInd(fileName)
          setIndPickerOpen(false)
        }}
      />
    </div>
  )
}
