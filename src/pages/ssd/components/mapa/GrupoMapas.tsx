// Bloco "Mapas para simulação" (Configurações do SSD): biblioteca de mapas
// (shapefile .zip ou raster GeoTIFF) cadastrados e configurados uma única vez
// e depois associados aos modelos na janela "Mapas" de cada modelo.
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { FileSelectDialog } from '../Importacao'
import { ConfigShapeForm } from './ConfigShape'
import { ConfigRasterForm } from './ConfigRaster'
import { VisualizadorMapas, type ItemMapa } from './VisualizadorMapas'
import { useArquivoMapa } from './useArquivoMapa'
import {
  limparCacheMapas,
  nomeDoArquivo,
  normalizarConfigRaster,
  normalizarConfigShape,
  tipoPeloArquivo,
  type ConfigRaster,
  type ConfigShape,
} from './dadosMapa'

export type MapaRow = {
  id_mapa: number
  tipo: 'shape' | 'raster'
  arquivo: string
  descricao: string | null
  config: any
  modelo_mapas?: { id_mod: number }[]
}

export function GrupoMapas() {
  const [mapas, setMapas] = useState<MapaRow[]>([])
  const [carregando, setCarregando] = useState(false)
  const [novoArquivo, setNovoArquivo] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [editando, setEditando] = useState<MapaRow | null>(null)

  const carregar = async () => {
    setCarregando(true)
    const { data, error } = await supabase.from('mapas').select('*, modelo_mapas(id_mod)').order('id_mapa')
    if (error) toast.error(`Erro ao carregar mapas: ${error.message}`)
    setMapas((data as any) || [])
    setCarregando(false)
  }

  useEffect(() => {
    limparCacheMapas()
    carregar()
  }, [])

  const adicionar = async () => {
    const tipo = tipoPeloArquivo(novoArquivo)
    if (!tipo) return toast.error('Escolha um arquivo .zip (shape) ou .tif (raster).')
    const { data, error } = await supabase
      .from('mapas')
      .insert({ tipo, arquivo: novoArquivo, descricao: novaDescricao.trim() || null, config: {} })
      .select('*, modelo_mapas(id_mod)')
      .single()
    if (error) return toast.error(`Erro ao cadastrar: ${error.message}`)
    setMapas((p) => [...p, data as any])
    setNovoArquivo('')
    setNovaDescricao('')
    toast.success('Mapa cadastrado. Configure a exibição pelo botão de edição.')
  }

  const excluir = async (m: MapaRow) => {
    const n = m.modelo_mapas?.length || 0
    const msg =
      n > 0
        ? `O mapa "${m.descricao || nomeDoArquivo(m.arquivo)}" está associado a ${n} modelo(s) e será removido deles. Excluir mesmo assim?`
        : `Excluir o mapa "${m.descricao || nomeDoArquivo(m.arquivo)}"?`
    if (!window.confirm(msg)) return
    const { data, error } = await supabase.from('mapas').delete().eq('id_mapa', m.id_mapa).select('id_mapa')
    if (error) return toast.error(`Erro ao excluir: ${error.message}`)
    if (!data || data.length === 0) return toast.error('O mapa não foi excluído: sem permissão.')
    setMapas((p) => p.filter((x) => x.id_mapa !== m.id_mapa))
    toast.success('Mapa excluído')
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Cadastre aqui os mapas exibidos na aba Mapa da Simulação (shape em .zip com .shp, .shx, .dbf e .prj, ou raster
        GeoTIFF). Envie os arquivos antes pelo bloco de upload, nas pastas mapas_shape e mapas_raster. Cada mapa é
        configurado uma única vez e pode ser associado a vários modelos, na coluna Mapas da tabela de modelos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end bg-white p-4 border rounded shadow-sm">
        <FileSelectDialog label="Arquivo do mapa (.zip ou .tif)" value={novoArquivo} onChange={setNovoArquivo} />
        <div className="space-y-1">
          <label className="text-xs font-semibold">Descrição</label>
          <Input value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Ex.: Poços do DAE" className="text-xs" />
        </div>
        <Button onClick={adicionar} disabled={!novoArquivo}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>

      <div className="border rounded-md bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-semibold w-20">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold">Descrição</th>
              <th className="px-3 py-2 text-left font-semibold">Arquivo</th>
              <th className="px-3 py-2 text-center font-semibold w-24">Modelos</th>
              <th className="px-3 py-2 text-center font-semibold w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {carregando && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  <Loader2 className="inline w-4 h-4 animate-spin mr-2" /> Carregando...
                </td>
              </tr>
            )}
            {!carregando && mapas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum mapa cadastrado.
                </td>
              </tr>
            )}
            {mapas.map((m) => (
              <tr key={m.id_mapa} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[11px] border ${
                      m.tipo === 'shape' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    {m.tipo === 'shape' ? 'Shape' : 'Raster'}
                  </span>
                </td>
                <td className="px-3 py-2">{m.descricao || <span className="text-muted-foreground">—</span>}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-500" title={m.arquivo}>
                  {nomeDoArquivo(m.arquivo)}
                </td>
                <td className="px-3 py-2 text-center">{m.modelo_mapas?.length || 0}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => setEditando(m)}
                      title="Editar e configurar a exibição"
                      className="p-1 rounded hover:bg-amber-100 text-amber-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => excluir(m)} title="Excluir" className="p-1 rounded hover:bg-red-100 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <EditorMapa
          mapa={editando}
          onFechar={() => setEditando(null)}
          onSalvo={(m) => {
            setMapas((p) => p.map((x) => (x.id_mapa === m.id_mapa ? { ...x, ...m } : x)))
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}

function EditorMapa({
  mapa,
  onFechar,
  onSalvo,
}: {
  mapa: MapaRow
  onFechar: () => void
  onSalvo: (m: MapaRow) => void
}) {
  const [arquivo, setArquivo] = useState(mapa.arquivo)
  const [descricao, setDescricao] = useState(mapa.descricao || '')
  const [cfgShape, setCfgShape] = useState<ConfigShape>(normalizarConfigShape(mapa.tipo === 'shape' ? mapa.config : null))
  const [cfgRaster, setCfgRaster] = useState<ConfigRaster>(normalizarConfigRaster(mapa.tipo === 'raster' ? mapa.config : null))
  const [preview, setPreview] = useState<ItemMapa[] | null>(null)
  const [salvando, setSalvando] = useState(false)

  const tipo = tipoPeloArquivo(arquivo)
  const trocouArquivo = arquivo !== mapa.arquivo
  const { shapes, raster, banda, carregando, erro } = useArquivoMapa({
    tipo,
    arquivo,
    encoding: cfgShape.dbf_encoding,
    banda: cfgRaster.banda,
    nodata: cfgRaster.nodata,
  })

  // Trocar o arquivo descarta a configuração (camadas, classes e cores do arquivo anterior)
  const trocarArquivo = (v: string) => {
    setArquivo(v)
    setCfgShape(normalizarConfigShape(null))
    setCfgRaster(normalizarConfigRaster(null))
    setPreview(null)
  }

  const configAtual = tipo === 'shape' ? cfgShape : cfgRaster

  const salvar = async () => {
    if (!tipo) return toast.error('Escolha um arquivo .zip (shape) ou .tif (raster).')
    setSalvando(true)
    const update = { tipo, arquivo, descricao: descricao.trim() || null, config: configAtual as any }
    const { data, error } = await supabase.from('mapas').update(update).eq('id_mapa', mapa.id_mapa).select('id_mapa')
    setSalvando(false)
    if (error) return toast.error(`Erro ao salvar: ${error.message}`)
    if (!data || data.length === 0) return toast.error('O mapa não foi gravado: sem permissão.')
    toast.success('Mapa salvo')
    onSalvo({ ...mapa, ...update })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Mapa — {descricao || nomeDoArquivo(arquivo)}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileSelectDialog label="Arquivo do mapa (.zip ou .tif)" value={arquivo} onChange={trocarArquivo} />
              <div className="space-y-1">
                <label className="text-xs font-semibold">Descrição</label>
                <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="text-xs" />
              </div>
            </div>
            {trocouArquivo && (
              <p className="text-xs text-amber-600">
                Arquivo trocado: a configuração de exibição foi reiniciada para o novo arquivo.
              </p>
            )}
            {!tipo && <p className="text-sm text-red-600">Tipo de arquivo não suportado. Use .zip (shape) ou .tif (raster).</p>}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-primary">Configuração de exibição</h4>
              {carregando && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Lendo o arquivo do mapa...
                </p>
              )}
              {erro && <p className="text-sm text-red-600">{erro}</p>}
              {!carregando && !erro && tipo === 'shape' && shapes && (
                <ConfigShapeForm shapes={shapes} config={cfgShape} onChange={setCfgShape} />
              )}
              {!carregando && !erro && tipo === 'raster' && raster && (
                <ConfigRasterForm raster={raster} banda={banda} config={cfgRaster} onChange={setCfgRaster} />
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                disabled={!tipo || carregando || !!erro}
                onClick={() =>
                  tipo &&
                  setPreview([
                    {
                      id: `prev-${arquivo}`,
                      tipo,
                      arquivo,
                      nome: descricao.trim() || nomeDoArquivo(arquivo),
                      config: JSON.parse(JSON.stringify(configAtual)),
                      visivel: true,
                    },
                  ])
                }
              >
                <Eye className="w-4 h-4 mr-2" /> {preview ? 'Atualizar pré-visualização' : 'Pré-visualizar'}
              </Button>
              {preview && <VisualizadorMapas itens={preview} altura={420} />}
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !tipo}>
            {salvando ? 'Salvando...' : 'Salvar mapa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
