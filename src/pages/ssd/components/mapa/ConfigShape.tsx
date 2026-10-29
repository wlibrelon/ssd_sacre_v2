// Configuração de exibição do mapa shape — mesmos recursos do formulário
// "Editar camada" da Gestão de Camadas (EPSG, codificação, campo de nome,
// nomes de exibição dos atributos, estilo e classificação), aplicados por
// camada (.shp) contida no .zip do modelo.
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Wand2 } from 'lucide-react'
import {
  calcularIntervaloIgual,
  calcularQuantidadeIgual,
  corCategoricaAutomatica,
  gerarRampaCores,
  type ModoGraduado,
} from '@/lib/classificacao'
import {
  configCamadaPadrao,
  type ConfigCamadaShape,
  type ConfigShape,
  type ShapeBruto,
  type CategoriaForm,
  type ClasseForm,
} from './dadosMapa'

export function ConfigShapeForm({
  shapes,
  config,
  onChange,
}: {
  shapes: ShapeBruto[]
  config: ConfigShape
  onChange: (c: ConfigShape) => void
}) {
  const [camadaAtual, setCamadaAtual] = useState(shapes[0]?.nome || '')
  const shape = shapes.find((s) => s.nome === camadaAtual) || shapes[0]
  if (!shape) return null
  const cc: ConfigCamadaShape = config.camadas[shape.nome] || configCamadaPadrao()
  const campos = shape.campos
  const epsgPrj = shapes.map((s) => s.epsgPrj).find((e) => e) || null

  const setCamada = (patch: Partial<ConfigCamadaShape>) =>
    onChange({ ...config, camadas: { ...config.camadas, [shape.nome]: { ...cc, ...patch } } })
  const estilo = cc.estilo
  const setEstilo = (p: Partial<typeof estilo>) => setCamada({ estilo: { ...estilo, ...p } })
  const cl = cc.classificacao
  const setCl = (p: Partial<typeof cl>) => setCamada({ classificacao: { ...cl, ...p } })

  const atualizarCategoria = (i: number, p: Partial<CategoriaForm>) =>
    setCl({ categorias: cl.categorias.map((c, k) => (k === i ? { ...c, ...p } : c)) })
  const atualizarClasse = (i: number, p: Partial<ClasseForm>) =>
    setCl({ classes: cl.classes.map((c, k) => (k === i ? { ...c, ...p } : c)) })

  // Valores do atributo lidos diretamente das feições do arquivo
  const valoresDoCampo = () =>
    shape.features.map((f) => f?.properties?.[cl.campo]).filter((v) => v !== null && v !== undefined && v !== '')

  const gerarCategorias = () => {
    const distintos = Array.from(new Set(valoresDoCampo().map((v) => String(v)))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { numeric: true }),
    )
    setCl({ categorias: distintos.map((v, i) => ({ valor: v, cor: corCategoricaAutomatica(i), rotulo: '' })) })
  }

  const gerarClasses = () => {
    const nums = valoresDoCampo()
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b)
    if (nums.length === 0) return
    const n = Math.max(2, Math.min(12, cl.numClasses || 5))
    const faixas =
      cl.modo === 'quantidade_igual'
        ? calcularQuantidadeIgual(nums, n)
        : calcularIntervaloIgual(nums[0], nums[nums.length - 1], n)
    const cores = gerarRampaCores(cl.corInicial, cl.corFinal, faixas.length)
    setCl({ numClasses: n, classes: faixas.map(([a, b], i) => ({ min: a, max: b, cor: cores[i], rotulo: '' })) })
  }

  return (
    <div className="space-y-4">
      {/* Parâmetros do arquivo (valem para todas as camadas do .zip) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>EPSG de Origem</Label>
          <Input
            type="number"
            placeholder={epsgPrj ? `${epsgPrj} (detectado no .prj)` : '4674'}
            value={config.epsg ?? ''}
            onChange={(e) => onChange({ ...config, epsg: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">
            Em branco, usa o sistema identificado no arquivo .prj (ou 4674 = SIRGAS 2000, se não houver).
            Se estiver em UTM, use o EPSG da zona (ex: 31982 para a zona 22S).
          </p>
        </div>
        <div className="space-y-2">
          <Label>Codificação de Texto do .dbf</Label>
          <Select value={config.dbf_encoding} onValueChange={(v) => onChange({ ...config, dbf_encoding: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latin1">ISO-8859-1 / Windows-1252 (Latin1)</SelectItem>
              <SelectItem value="utf-8">UTF-8</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Se acentos aparecerem errados (ex: "Ã§Ã£o" em vez de "ção"), troque esta opção.
          </p>
        </div>
      </div>

      {shapes.length > 1 && (
        <div className="space-y-2">
          <Label>Camada em configuração</Label>
          <Select value={shape.nome} onValueChange={setCamadaAtual}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shapes.map((s) => (
                <SelectItem key={s.nome} value={s.nome}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            O arquivo contém {shapes.length} camadas. As opções abaixo valem para a camada escolhida.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Campo de Nome da Feição (opcional)</Label>
        <Select value={cc.campoNome || '__nenhum__'} onValueChange={(v) => setCamada({ campoNome: v === '__nenhum__' ? '' : v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um campo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__nenhum__">(nenhum)</SelectItem>
            {campos.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Usado como título da janela de detalhes ao clicar numa feição.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Nomes de exibição dos atributos</Label>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setCamada({ nomesAtributos: Object.fromEntries(campos.map((c) => [c, c])) })}
            >
              Usar nomes originais
            </button>
            <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => setCamada({ nomesAtributos: {} })}>
              Limpar
            </button>
          </div>
        </div>
        <div className="border rounded-md overflow-hidden">
          <div className="grid grid-cols-2 gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b bg-muted/30">
            <span>Atributo</span>
            <span>Nome de exibição</span>
          </div>
          <div className="p-2 max-h-[160px] overflow-y-auto space-y-1">
            {campos.length === 0 && <p className="text-xs text-muted-foreground p-1">A camada não possui atributos.</p>}
            {campos.map((c) => (
              <div key={c} className="grid grid-cols-2 gap-2 items-center">
                <span className="text-sm truncate" title={c}>
                  {c}
                </span>
                <Input
                  className="h-8"
                  placeholder="(oculto no mapa)"
                  value={cc.nomesAtributos[c] || ''}
                  onChange={(e) => setCamada({ nomesAtributos: { ...cc.nomesAtributos, [c]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Nome exibido ao clicar numa feição. Atributos sem nome ficam ocultos; se nenhum tiver nome, todos são exibidos
          com o nome original.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-md">
        <div className="space-y-2">
          <Label>Cor Preench.</Label>
          <Input type="color" className="h-10 w-full" value={estilo.fillColor} onChange={(e) => setEstilo({ fillColor: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Cor Borda</Label>
          <Input type="color" className="h-10 w-full" value={estilo.color} onChange={(e) => setEstilo({ color: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Espessura (px)</Label>
          <Input type="number" min={0} value={estilo.weight} onChange={(e) => setEstilo({ weight: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Opacidade (0-1)</Label>
          <Input
            type="number"
            step={0.1}
            min={0}
            max={1}
            value={estilo.opacity}
            onChange={(e) => setEstilo({ opacity: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Símbolo do Ponto</Label>
          <Select value={estilo.pointSymbol} onValueChange={(v) => setEstilo({ pointSymbol: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Círculo</SelectItem>
              <SelectItem value="square">Quadrado</SelectItem>
              <SelectItem value="triangle">Triângulo</SelectItem>
              <SelectItem value="star">Estrela</SelectItem>
              <SelectItem value="cross">Cruz</SelectItem>
              <SelectItem value="diamond">Losango</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Usado quando a camada é do tipo ponto.</p>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Tipo de Linha</Label>
          <Select value={estilo.lineStyle} onValueChange={(v) => setEstilo({ lineStyle: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Sólida</SelectItem>
              <SelectItem value="dashed">Tracejada</SelectItem>
              <SelectItem value="dotted">Pontilhada</SelectItem>
              <SelectItem value="dashdot">Traço-ponto</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Usado em linhas e na borda de polígonos.</p>
        </div>
      </div>

      {/* Classificação */}
      <div className="border rounded-md p-4 space-y-4">
        <p className="text-sm font-semibold">Classificação</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Atributo Principal</Label>
            <Select
              value={cl.campo || '__nenhum__'}
              onValueChange={(v) => setCl({ campo: v === '__nenhum__' ? '' : v, tipo: v === '__nenhum__' ? '' : cl.tipo })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um atributo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__nenhum__">(nenhum)</SelectItem>
                {campos.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Classificação</Label>
            <Select
              value={cl.tipo || 'nenhuma'}
              onValueChange={(v) => setCl({ tipo: v === 'nenhuma' ? '' : (v as 'categorico' | 'graduado') })}
              disabled={!cl.campo}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Nenhuma (cor única)</SelectItem>
                <SelectItem value="categorico">Categórico</SelectItem>
                <SelectItem value="graduado">Graduado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Categórico: uma cor sólida por valor. Graduado: cores em faixas de valores numéricos.
            </p>
          </div>
        </div>

        {cl.tipo !== '' && (
          <div className="space-y-2">
            <Label>Rótulo do Atributo</Label>
            <Input placeholder={cl.campo} value={cl.rotuloCampo} onChange={(e) => setCl({ rotuloCampo: e.target.value })} />
            <p className="text-xs text-muted-foreground">Nome amigável exibido na legenda. Em branco, usa o nome do atributo.</p>
          </div>
        )}

        {cl.tipo === 'categorico' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Categorias</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={gerarCategorias}>
                  <Wand2 className="w-4 h-4 mr-2" /> Gerar a partir dos dados
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCl({
                      categorias: [...cl.categorias, { valor: '', cor: corCategoricaAutomatica(cl.categorias.length), rotulo: '' }],
                    })
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-[1fr_72px_1fr_32px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                <span>Valor</span>
                <span>Cor</span>
                <span>Rótulo (opcional)</span>
                <span />
              </div>
              <div className="p-2 max-h-[180px] overflow-y-auto space-y-1">
                {cl.categorias.length === 0 && <p className="text-xs text-muted-foreground p-1">Nenhuma categoria configurada.</p>}
                {cl.categorias.map((cat, i) => (
                  <div key={i} className="grid grid-cols-[1fr_72px_1fr_32px] gap-2 items-center">
                    <Input className="h-8" value={cat.valor} onChange={(e) => atualizarCategoria(i, { valor: e.target.value })} />
                    <Input type="color" className="h-8 w-full" value={cat.cor} onChange={(e) => atualizarCategoria(i, { cor: e.target.value })} />
                    <Input
                      className="h-8"
                      placeholder={cat.valor}
                      value={cat.rotulo}
                      onChange={(e) => atualizarCategoria(i, { rotulo: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCl({ categorias: cl.categorias.filter((_, k) => k !== i) })}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {cl.tipo === 'graduado' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Modo</Label>
                <Select value={cl.modo} onValueChange={(v) => setCl({ modo: v as ModoGraduado })}>
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
                <Input type="number" min={2} max={12} value={cl.numClasses} onChange={(e) => setCl({ numClasses: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Rampa de Cores</Label>
                <div className="flex gap-1">
                  <Input type="color" className="h-10 w-full" value={cl.corInicial} onChange={(e) => setCl({ corInicial: e.target.value })} />
                  <Input type="color" className="h-10 w-full" value={cl.corFinal} onChange={(e) => setCl({ corFinal: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={gerarClasses}>
                <Wand2 className="w-4 h-4 mr-2" /> Gerar classes a partir dos dados
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCl({ classes: [...cl.classes, { min: 0, max: 0, cor: '#bd0026', rotulo: '' }] })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ListaClasses classes={cl.classes} onAtualizar={atualizarClasse} onRemover={(i) => setCl({ classes: cl.classes.filter((_, k) => k !== i) })} />
          </div>
        )}
      </div>
    </div>
  )
}

/** Tabela editável de classes (min, max, cor, rótulo) — usada no shape e no raster. */
export function ListaClasses({
  classes,
  onAtualizar,
  onRemover,
}: {
  classes: ClasseForm[]
  onAtualizar: (i: number, p: Partial<ClasseForm>) => void
  onRemover: (i: number) => void
}) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_72px_1fr_32px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b bg-muted/30">
        <span>Min</span>
        <span>Max</span>
        <span>Cor</span>
        <span>Rótulo (opcional)</span>
        <span />
      </div>
      <div className="p-2 max-h-[180px] overflow-y-auto space-y-1">
        {classes.length === 0 && <p className="text-xs text-muted-foreground p-1">Nenhuma classe configurada.</p>}
        {classes.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_72px_1fr_32px] gap-2 items-center">
            <Input className="h-8" type="number" value={c.min} onChange={(e) => onAtualizar(i, { min: Number(e.target.value) })} />
            <Input className="h-8" type="number" value={c.max} onChange={(e) => onAtualizar(i, { max: Number(e.target.value) })} />
            <Input type="color" className="h-8 w-full" value={c.cor} onChange={(e) => onAtualizar(i, { cor: e.target.value })} />
            <Input
              className="h-8"
              placeholder={`${c.min} – ${c.max}`}
              value={c.rotulo}
              onChange={(e) => onAtualizar(i, { rotulo: e.target.value })}
            />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemover(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
