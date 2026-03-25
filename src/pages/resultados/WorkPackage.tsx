import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { Download, FileText } from 'lucide-react'

const wpContent: Record<
  string,
  { title: string; desc: string; type: 'bar' | 'area'; data: any[] }
> = {
  '1': {
    title: 'WP 1: Contexto e Demandas',
    desc: 'Levantamento detalhado do histórico de consumo, faturamento e matriz hídrica da cidade. Análise das tendências de longo prazo.',
    type: 'bar',
    data: [
      { name: 'Residencial', val: 60 },
      { name: 'Industrial', val: 25 },
      { name: 'Comercial', val: 10 },
      { name: 'Público', val: 5 },
    ],
  },
  '2': {
    title: 'WP 2: Modelagem Climática',
    desc: 'Projeções de cenários climáticos utilizando modelos globais reduzidos para a escala da bacia do Rio Batalha.',
    type: 'area',
    data: [
      { name: '2025', val: 1200 },
      { name: '2030', val: 1150 },
      { name: '2040', val: 1050 },
      { name: '2050', val: 950 },
    ],
  },
  // Default fallback for others
}

export default function WorkPackage() {
  const { id } = useParams()
  const content = wpContent[id as string] || {
    title: `Work Package ${id}: Estruturação Técnica`,
    desc: 'Dados consolidados em andamento pelas equipes de pesquisa. Os resultados preliminares indicam forte viabilidade para integração de sistemas.',
    type: 'bar',
    data: [
      { name: 'Q1', val: 20 },
      { name: 'Q2', val: 45 },
      { name: 'Q3', val: 80 },
    ],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-secondary font-semibold tracking-wider text-sm uppercase">
            Resultados Científicos
          </span>
          <h1 className="text-3xl font-bold text-primary mt-1">{content.title}</h1>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Baixar Relatório Completo
        </Button>
      </div>

      <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed">{content.desc}</p>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visualização de Dados</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer
              config={{ val: { label: 'Valor', color: 'hsl(var(--secondary))' } }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {content.type === 'bar' ? (
                  <BarChart
                    data={content.data}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="val" fill="var(--color-val)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart
                    data={content.data}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="val"
                      fill="var(--color-val)"
                      fillOpacity={0.2}
                      stroke="var(--color-val)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Documentos Anexos</h3>
          {[1, 2].map((file) => (
            <Card key={file} className="hover:bg-slate-50 transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-sm">Resumo Executivo_v{file}.pdf</p>
                  <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
