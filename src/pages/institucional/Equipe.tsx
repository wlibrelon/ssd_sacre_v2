import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const team = [
  { id: 1, name: 'Dr. Roberto Alves', role: 'Coordenador Principal', org: 'Universidade Estadual' },
  { id: 2, name: 'Dra. Maria Fernanda', role: 'Pesquisadora - WP1', org: 'Instituto de Águas' },
  { id: 3, name: 'Eng. Carlos Santos', role: 'Líder Técnico - SSD', org: 'TechWater Solutions' },
  { id: 4, name: 'Ana Beatriz', role: 'Analista de Dados', org: 'Universidade Estadual' },
  { id: 5, name: 'João Pedro', role: 'Membro - WP3', org: 'FAPESP' },
  { id: 6, name: 'Dra. Luciana', role: 'Pesquisadora - Modelagem Climática', org: 'INPE' },
]

export default function Equipe() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Equipe do Projeto</h1>
        <p className="text-muted-foreground">
          Conheça os pesquisadores e profissionais envolvidos no desenvolvimento do SACRE.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {team.map((member) => (
          <Card key={member.id} className="text-center hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-slate-50">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?seed=${member.id}`}
                  alt={member.name}
                />
                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{member.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-secondary">{member.role}</p>
              <p className="text-xs text-muted-foreground mt-1">{member.org}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
