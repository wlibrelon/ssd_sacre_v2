import { useState, useEffect } from 'react'
import { getTable, insertRow, deleteRow } from '@/services/ssd'
import { useSsdData } from '@/hooks/use-ssd-data'
import { NativeSelect } from './NativeSelect'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2 } from 'lucide-react'

export function Grupo2() {
  const { fonte_agua, tipos_cenarios, acoes, cenarios } = useSsdData()
  const [cf, setCf] = useState<any[]>([])
  const [af, setAf] = useState<any[]>([])
  const [tcc, setTcc] = useState<any[]>([])

  const [f1, setF1] = useState('')
  const [tc, setTc] = useState('')
  const [f2, setF2] = useState('')
  const [e, setE] = useState('')
  const [tc2, setTc2] = useState('')
  const [c, setC] = useState('')

  const load = async () => {
    setCf(await getTable('cenarios_fonte'))
    setAf(await getTable('acoes_fonte'))
    setTcc(await getTable('tipo_cenario_cenario'))
  }
  useEffect(() => {
    load()
  }, [])

  const getFonteName = (id: number) =>
    fonte_agua.find((x: any) => x.id_fonte === id)?.nome_fonte || id
  const getTcName = (id: number) => tipos_cenarios.find((x: any) => x.id_tc === id)?.descricao || id
  const getAcaoName = (id: number) => acoes.find((x: any) => x.id_acao === id)?.descricao || id
  const getCName = (id: number) => cenarios.find((x: any) => x.id_cenarios === id)?.cenarios || id

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 shadow rounded border space-y-4">
          <h3 className="font-semibold text-sm">Tipos de Cenário por Fonte</h3>
          <div className="flex flex-col gap-2">
            <NativeSelect
              options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
              value={f1}
              onChange={setF1}
              placeholder="Selecione Fonte"
            />
            <NativeSelect
              options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
              value={tc}
              onChange={setTc}
              placeholder="Selecione Tipo Cenário"
            />
            <Button
              onClick={async () => {
                await insertRow('cenarios_fonte', { id_fonte: f1, id_tc: tc })
                load()
              }}
            >
              Adicionar
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2">Fonte</TableHead>
                  <TableHead className="py-2">Tipo Cenário</TableHead>
                  <TableHead className="py-2 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cf.map((row) => (
                  <TableRow key={row.id_cf}>
                    <TableCell className="py-1 text-sm">{getFonteName(row.id_fonte)}</TableCell>
                    <TableCell className="py-1 text-sm">{getTcName(row.id_tc)}</TableCell>
                    <TableCell className="py-1 text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          await deleteRow('cenarios_fonte', 'id_cf', row.id_cf)
                          load()
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
        </div>

        <div className="bg-white p-4 shadow rounded border space-y-4">
          <h3 className="font-semibold text-sm">Cenários por Tipo de Cenário</h3>
          <div className="flex flex-col gap-2">
            <NativeSelect
              options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
              value={tc2}
              onChange={setTc2}
              placeholder="Selecione Tipo Cenário"
            />
            <NativeSelect
              options={cenarios.map((o: any) => ({ value: o.id_cenarios, label: o.cenarios }))}
              value={c}
              onChange={setC}
              placeholder="Selecione Cenário"
            />
            <Button
              onClick={async () => {
                await insertRow('tipo_cenario_cenario', { id_tc: tc2, id_c: c })
                load()
              }}
            >
              Adicionar
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2">Tipo Cenário</TableHead>
                  <TableHead className="py-2">Cenário</TableHead>
                  <TableHead className="py-2 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tcc.map((row) => (
                  <TableRow key={row.id_tcc}>
                    <TableCell className="py-1 text-sm">{getTcName(row.id_tc)}</TableCell>
                    <TableCell className="py-1 text-sm">{getCName(row.id_c)}</TableCell>
                    <TableCell className="py-1 text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          await deleteRow('tipo_cenario_cenario', 'id_tcc', row.id_tcc)
                          load()
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
        </div>

        <div className="bg-white p-4 shadow rounded border space-y-4">
          <h3 className="font-semibold text-sm">Ações por Fonte</h3>
          <div className="flex flex-col gap-2">
            <NativeSelect
              options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
              value={f2}
              onChange={setF2}
              placeholder="Selecione Fonte"
            />
            <NativeSelect
              options={acoes.map((o: any) => ({
                value: o.id_acao,
                label: o.descricao,
              }))}
              value={e}
              onChange={setE}
              placeholder="Selecione a Ação"
            />
            <Button
              onClick={async () => {
                await insertRow('acoes_fonte', { id_fonte: f2, id_acao: e })
                load()
              }}
            >
              Adicionar
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2">Fonte</TableHead>
                  <TableHead className="py-2">Ação</TableHead>
                  <TableHead className="py-2 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {af.map((row) => (
                  <TableRow key={row.id_ef}>
                    <TableCell className="py-1 text-sm">{getFonteName(row.id_fonte)}</TableCell>
                    <TableCell className="py-1 text-sm">{getAcaoName(row.id_acao)}</TableCell>
                    <TableCell className="py-1 text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          await deleteRow('acoes_fonte', 'id_ef', row.id_ef)
                          load()
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
        </div>
      </div>
    </div>
  )
}
