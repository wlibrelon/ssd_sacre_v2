import React, { useState, useEffect } from 'react'
import { useSsdData } from '@/hooks/useSsdData' // Adjust path as needed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Fonte {
  id: string
  nome: string
}

interface TipoCenario {
  id: string
  nome: string
}

interface Cenario {
  id: string
  nome: string
}

interface Estrategia {
  id: string
  nome: string
}

interface CenarioFonte {
  id_fonte: string
  id_tc: string
  id_cenario: string
}

interface EstrategiaFonte {
  id_fonte: string
  id_estrategia: string
}

interface Associacao {
  id_fonte: string
  id_tc: string
  id_cenario: string
  id_estrategia: string
}

const Grupo3: React.FC = () => {
  const { data, getTable } = useSsdData()

  const fontes: Fonte[] = data?.fontes || []
  const tiposCenariosBase: TipoCenario[] = data?.tipos_cenarios || []
  const cenariosBase: Cenario[] = data?.cenarios || []
  const estrategiasBase: Estrategia[] = data?.estrategias || []

  const [cenariosFonte, setCenariosFonte] = useState<CenarioFonte[]>([])
  const [estrategiasFonte, setEstrategiasFonte] = useState<EstrategiaFonte[]>([])
  const [associacoes, setAssociacoes] = useState<Associacao[]>([])
  const [filteredTiposCenarios, setFilteredTiposCenarios] = useState<TipoCenario[]>([])
  const [filteredCenarios, setFilteredCenarios] = useState<Cenario[]>([])
  const [filteredEstrategias, setFilteredEstrategias] = useState<Estrategia[]>([])

  const [form, setForm] = useState({
    id_fonte: '',
    id_tc: '',
    id_cenario: '',
    id_estrategia: '',
  })

  useEffect(() => {
    getTable('cenarios_fonte').then((res: CenarioFonte[]) => setCenariosFonte(res))
    getTable('estrategias_fonte').then((res: EstrategiaFonte[]) => setEstrategiasFonte(res))
    getTable('grupo3_associacoes').then((res: Associacao[]) => setAssociacoes(res))
  }, [getTable])

  useEffect(() => {
    if (!form.id_fonte) {
      setFilteredTiposCenarios([])
      setFilteredCenarios([])
      setFilteredEstrategias([])
      return
    }

    // Filter tipos cenários and estratégias
    const cf = cenariosFonte.filter((c) => c.id_fonte === form.id_fonte)
    const uniqueTc = Array.from(new Set(cf.map((c) => c.id_tc)))
    setFilteredTiposCenarios(tiposCenariosBase.filter((tc) => uniqueTc.includes(tc.id)))

    const ef = estrategiasFonte.filter((e) => e.id_fonte === form.id_fonte)
    const uniqueE = Array.from(new Set(ef.map((e) => e.id_estrategia)))
    setFilteredEstrategias(estrategiasBase.filter((e) => uniqueE.includes(e.id)))
  }, [form.id_fonte, cenariosFonte, estrategiasFonte, tiposCenariosBase, estrategiasBase])

  useEffect(() => {
    if (!form.id_fonte || !form.id_tc) {
      setFilteredCenarios([])
      return
    }

    const cf = cenariosFonte.filter((c) => c.id_fonte === form.id_fonte && c.id_tc === form.id_tc)
    const uniqueC = Array.from(new Set(cf.map((c) => c.id_cenario)))
    setFilteredCenarios(cenariosBase.filter((c) => uniqueC.includes(c.id)))
  }, [form.id_fonte, form.id_tc, cenariosFonte, cenariosBase])

  const handleFonteChange = (id_fonte: string) => {
    setForm({ id_fonte, id_tc: '', id_cenario: '', id_estrategia: '' })
  }

  const handleTcChange = (id_tc: string) => {
    setForm((prev) => ({ ...prev, id_tc, id_cenario: '' }))
  }

  const handleCenarioChange = (id_cenario: string) => {
    setForm((prev) => ({ ...prev, id_cenario }))
  }

  const handleEstrategiaChange = (id_estrategia: string) => {
    setForm((prev) => ({ ...prev, id_estrategia }))
  }

  const handleAdd = () => {
    if (!form.id_fonte || !form.id_tc || !form.id_cenario || !form.id_estrategia) return

    const newAssoc: Associacao = {
      id_fonte: form.id_fonte,
      id_tc: form.id_tc,
      id_cenario: form.id_cenario,
      id_estrategia: form.id_estrategia,
    }

    if (
      associacoes.some(
        (a) =>
          a.id_fonte === newAssoc.id_fonte &&
          a.id_tc === newAssoc.id_tc &&
          a.id_cenario === newAssoc.id_cenario &&
          a.id_estrategia === newAssoc.id_estrategia,
      )
    ) {
      return // Duplicate
    }

    setAssociacoes((prev) => [...prev, newAssoc])
    // TODO: Integrate original persistence logic, e.g., insertTable('grupo3_associacoes', newAssoc)

    setForm((prev) => ({ ...prev, id_tc: '', id_cenario: '', id_estrategia: '' }))
  }

  const handleDelete = (assoc: Associacao) => {
    setAssociacoes((prev) =>
      prev.filter(
        (a) =>
          !(
            a.id_fonte === assoc.id_fonte &&
            a.id_tc === assoc.id_tc &&
            a.id_cenario === assoc.id_cenario &&
            a.id_estrategia === assoc.id_estrategia
          ),
      ),
    )
    // TODO: Integrate original persistence logic, e.g., deleteTable('grupo3_associacoes', assoc)
  }

  const getNome = (id: string, lista: any[]): string => {
    return lista.find((item) => item.id === id)?.nome || id
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Associação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={form.id_fonte} onValueChange={handleFonteChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a Fonte de Água" />
            </SelectTrigger>
            <SelectContent>
              {fontes.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.id_tc} onValueChange={handleTcChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Cenário" />
            </SelectTrigger>
            <SelectContent>
              {filteredTiposCenarios.map((tc) => (
                <SelectItem key={tc.id} value={tc.id}>
                  {tc.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.id_cenario} onValueChange={handleCenarioChange}>
            <SelectTrigger>
              <SelectValue placeholder="Cenário" />
            </SelectTrigger>
            <SelectContent>
              {filteredCenarios.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.id_estrategia} onValueChange={handleEstrategiaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Estratégia" />
            </SelectTrigger>
            <SelectContent>
              {filteredEstrategias.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="w-full">
            Adicionar
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Associações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Tipo Cenário</TableHead>
                <TableHead>Cenário</TableHead>
                <TableHead>Estratégia</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associacoes.map((assoc, index) => (
                <TableRow key={index}>
                  <TableCell className="py-1 font-medium">
                    {getNome(assoc.id_fonte, fontes)}
                  </TableCell>
                  <TableCell className="py-1">{getNome(assoc.id_tc, tiposCenariosBase)}</TableCell>
                  <TableCell className="py-1">{getNome(assoc.id_cenario, cenariosBase)}</TableCell>
                  <TableCell className="py-1">
                    {getNome(assoc.id_estrategia, estrategiasBase)}
                  </TableCell>
                  <TableCell className="py-1">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(assoc)}>
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {associacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center py-1">
                    Nenhuma associação.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Grupo3
