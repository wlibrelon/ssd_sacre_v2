// Configuração de exibição do mapa raster: ajuste de cores conforme os
// valores dos pixels (rampa contínua ou classes de valores).
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Wand2 } from 'lucide-react'
import {
  calcularIntervaloIgual,
  calcularQuantidadeIgual,
  gerarRampaCores,
  type ModoGraduado,
} from '@/lib/classificacao'
import { ListaClasses } from './ConfigShape'
import type { ConfigRaster, RasterBanda, RasterCarregado } from './dadosMapa'

const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 4 })

export function ConfigRasterForm({
  raster,
  banda,
  config,
  onChange,
}: {
  raster: RasterCarregado
  banda: RasterBanda | null
  config: ConfigRaster
  onChange: (c: ConfigRaster) => void
}) {
  const set = (p: Partial<ConfigRaster>) => onChange({ ...config, ...p })
  const num = (v: string) => (v === '' ? null : Number(v))

  const gerarClasses = () => {
    if (!banda || banda.amostraOrdenada.length === 0) return
    const n = Math.max(2, Math.min(12, config.numClasses || 5))
    const faixas =
      config.modoClasses === 'quantidade_igual'
        ? calcularQuantidadeIgual(banda.amostraOrdenada, n)
        : calcularIntervaloIgual(banda.min, banda.max, n)
    const cores = gerarRampaCores(config.corInicial, config.corFinal, faixas.length)
    set({ numClasses: n, classes: faixas.map(([a, b], i) => ({ min: a, max: b, cor: cores[i], rotulo: '' })) })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>EPSG de Origem</Label>
          <Input
            type="number"
            placeholder={raster.epsgDetectado ? `${raster.epsgDetectado} (do arquivo)` : 'informe o EPSG'}
            value={config.epsg ?? ''}
            onChange={(e) => set({ epsg: num(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">
            Em branco, usa o sistema de coordenadas gravado no GeoTIFF.
          </p>
        </div>
        {raster.bandas > 1 && (
          <div className="space-y-2">
            <Label>Banda</Label>
            <Select value={String(config.banda)} onValueChange={(v) => set({ banda: Number(v) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: raster.bandas }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    Banda {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Valor sem dado (NoData)</Label>
          <Input
            type="number"
            placeholder={raster.nodataArquivo !== null ? `${raster.nodataArquivo} (do arquivo)` : '(nenhum)'}
            value={config.nodata ?? ''}
            onChange={(e) => set({ nodata: num(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">Pixels com este valor ficam transparentes.</p>
        </div>
        <div className="space-y-2">
          <Label>Opacidade (0-1)</Label>
          <Input
            type="number"
            step={0.1}
            min={0}
            max={1}
            value={config.opacidade}
            onChange={(e) => set({ opacidade: Number(e.target.value) })}
          />
        </div>
      </div>

      {banda && (
        <p className="text-xs text-muted-foreground">
          Valores encontrados no arquivo: mínimo {fmt(banda.min)} · máximo {fmt(banda.max)}
        </p>
      )}

      <div className="border rounded-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de coloração</Label>
            <Select value={config.modo} onValueChange={(v) => set({ modo: v as ConfigRaster['modo'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="continuo">Contínua (rampa de cores)</SelectItem>
                <SelectItem value="classes">Classes de valores</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Contínua: a cor varia gradualmente entre o valor mínimo e o máximo. Classes: uma cor por faixa de
              valores.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Rampa de Cores</Label>
            <div className="flex gap-1">
              <Input type="color" className="h-10 w-full" value={config.corInicial} onChange={(e) => set({ corInicial: e.target.value })} />
              <Input type="color" className="h-10 w-full" value={config.corFinal} onChange={(e) => set({ corFinal: e.target.value })} />
            </div>
            <p className="text-xs text-muted-foreground">Cor dos menores valores → cor dos maiores valores.</p>
          </div>
        </div>

        {config.modo === 'continuo' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor mínimo</Label>
              <Input
                type="number"
                placeholder={banda ? fmt(banda.min) : ''}
                value={config.min ?? ''}
                onChange={(e) => set({ min: num(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor máximo</Label>
              <Input
                type="number"
                placeholder={banda ? fmt(banda.max) : ''}
                value={config.max ?? ''}
                onChange={(e) => set({ max: num(e.target.value) })}
              />
            </div>
            <p className="text-xs text-muted-foreground col-span-2">
              Em branco, usa o mínimo e o máximo dos dados. Valores fora da faixa recebem a cor do extremo mais próximo.
            </p>
          </div>
        )}

        {config.modo === 'classes' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modo</Label>
                <Select value={config.modoClasses} onValueChange={(v) => set({ modoClasses: v as ModoGraduado })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intervalo_igual">Intervalo Igual</SelectItem>
                    <SelectItem value="quantidade_igual">Quantidade Igual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nº de Classes</Label>
                <Input type="number" min={2} max={12} value={config.numClasses} onChange={(e) => set({ numClasses: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={gerarClasses} disabled={!banda}>
                <Wand2 className="w-4 h-4 mr-2" /> Gerar classes a partir dos dados
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => set({ classes: [...config.classes, { min: 0, max: 0, cor: config.corFinal, rotulo: '' }] })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ListaClasses
              classes={config.classes}
              onAtualizar={(i, p) => set({ classes: config.classes.map((c, k) => (k === i ? { ...c, ...p } : c)) })}
              onRemover={(i) => set({ classes: config.classes.filter((_, k) => k !== i) })}
            />
            <p className="text-xs text-muted-foreground">Pixels fora de todas as classes ficam transparentes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
