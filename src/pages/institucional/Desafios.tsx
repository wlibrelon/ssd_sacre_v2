import { CheckCircle2 } from 'lucide-react'

export default function Desafios() {
  const desafios = [
    'Escassez hídrica devido a anomalias climáticas severas.',
    'Alto índice de perdas na rede de distribuição urbana.',
    'Falta de integração entre dados meteorológicos e operacionais.',
    'Necessidade de políticas públicas de reuso de água e captação pluvial.',
    'Expansão demográfica não acompanhada pela infraestrutura de saneamento.',
  ]

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary">Desafios Enfrentados</h1>
      <div className="prose text-muted-foreground">
        <p>
          A gestão de recursos hídricos em ambientes urbanos complexos exige a mitigação de
          problemas estruturais e climáticos. O SACRE identifica as principais barreiras para a
          sustentabilidade:
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <ul className="space-y-4">
          {desafios.map((desafio, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
              <span className="text-slate-700 font-medium">{desafio}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
