import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Megaphone, Users, Settings, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  const areas = [
    {
      title: 'Dados dos Projetos',
      icon: Database,
      desc: 'Gerenciar matrizes de dados, fontes hidrológicas e parâmetros brutos para as simulações do SSD.',
    },
    {
      title: 'Inclusão de Divulgações',
      icon: Megaphone,
      desc: 'Adicionar e editar publicações científicas, notícias na mídia, eventos e atividades sociais.',
    },
    {
      title: 'Cadastros',
      icon: Users,
      desc: 'Gerir perfis de acesso, pesquisadores da equipe e conceder permissões para novos parceiros institucionais.',
    },
    {
      title: 'Configurações',
      icon: Settings,
      desc: 'Ajustes gerais do portal, gestão de APIs externas e personalização da interface administrativa.',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Acesso Restrito</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Painel Administrativo. Autenticado como:{' '}
            <strong className="text-secondary uppercase">{user?.role}</strong>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {areas.map((area) => (
          <Card
            key={area.title}
            className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-transparent hover:border-l-secondary"
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <area.icon className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {area.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px] leading-relaxed">
                {area.desc}
              </p>
              <Button variant="ghost" className="w-full justify-between group-hover:bg-slate-50">
                Acessar Módulo <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
