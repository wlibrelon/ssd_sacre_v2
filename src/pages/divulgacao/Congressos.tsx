import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, MapPin } from 'lucide-react'

export default function Congressos() {
  const events = [
    {
      title: 'Simpósio Internacional de Recursos Hídricos',
      date: '15-18 Novembro, 2025',
      location: 'São Paulo, SP',
      status: 'Próximo',
    },
    {
      title: 'Congresso Brasileiro de Engenharia Sanitária',
      date: '04-06 Maio, 2025',
      location: 'Belo Horizonte, MG',
      status: 'Realizado',
    },
    {
      title: 'Workshop Living Labs FAPESP',
      date: '12 Fevereiro, 2025',
      location: 'Campinas, SP',
      status: 'Realizado',
    },
  ]

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary">Congressos e Eventos</h1>
        <p className="text-muted-foreground mt-2">
          Participações e eventos organizados no escopo do projeto.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-8">
            <div
              className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${event.status === 'Próximo' ? 'bg-secondary border-white shadow-[0_0_0_2px_hsl(var(--secondary))]' : 'bg-slate-300 border-white'}`}
            />
            <Card
              className={event.status === 'Próximo' ? 'border-secondary/30 bg-secondary/5' : ''}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-primary">{event.title}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${event.status === 'Próximo' ? 'bg-secondary text-white' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {event.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
