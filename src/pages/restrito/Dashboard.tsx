import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Database, Users, Download } from 'lucide-react'

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a), {user?.name}. Nível de acesso:{' '}
            <span className="font-semibold uppercase text-secondary">{user?.role}</span>
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar Logs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">+2 adicionados este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Usuários Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">Gestores e pesquisadores</p>
          </CardContent>
        </Card>
        <Card className="border-secondary/50 bg-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-secondary-foreground">
              Acessos Pendentes
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">3</div>
            <Button variant="link" className="p-0 h-auto text-xs">
              Revisar solicitações
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Logs Recentes do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 text-sm border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="w-24 text-muted-foreground shrink-0">Hoje, 14:{i}0</div>
                <div className="font-medium truncate flex-1">
                  Script Python{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">run_scenario_v2.py</code>{' '}
                  executado.
                </div>
                <div className="text-green-600 font-medium">Sucesso</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
