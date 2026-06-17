import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, MapPin, Building2, ExternalLink } from 'lucide-react'

export default function Congressos() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('congressos')
        .select('*')
        .order('data', { ascending: false })
      if (data) setEvents(data)
    }
    fetchEvents()
  }, [])

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary">Congressos e Eventos</h1>
        <p className="text-muted-foreground mt-2">
          Participações e eventos organizados no escopo do projeto.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
        {events.map((event) => {
          const isUpcoming = event.status === 'Próximo'
          const dateStr = event.data
            ? new Date(event.data).toLocaleDateString('pt-BR')
            : event.periodo

          return (
            <div key={event.id_congresso} className="relative pl-8">
              <div
                className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
                  isUpcoming
                    ? 'bg-secondary border-white shadow-[0_0_0_2px_hsl(var(--secondary))]'
                    : 'bg-slate-300 border-white'
                }`}
              />
              <Card className={isUpcoming ? 'border-secondary/30 bg-secondary/5' : ''}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-primary leading-tight pr-4">
                      {event.link ? (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-secondary flex items-center gap-2"
                        >
                          {event.titulo} <ExternalLink className="h-4 w-4 shrink-0" />
                        </a>
                      ) : (
                        event.titulo
                      )}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                        isUpcoming ? 'bg-secondary text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground mt-4">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-primary/60" />
                      {dateStr || 'Data a definir'}
                    </span>
                    {event.local && (
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                        {event.local}
                      </span>
                    )}
                    {event.organizador && (
                      <span className="flex items-center gap-2 sm:col-span-2">
                        <Building2 className="h-4 w-4 shrink-0 text-primary/60" />
                        Organização: {event.organizador}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {events.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          Nenhum evento cadastrado no momento.
        </p>
      )}
    </div>
  )
}
