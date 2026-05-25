import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
// import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function AuthPage() {
  const { signIn, signUp, resetPassword, isPending } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [role, setRole] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const email = (document.getElementById('email') as HTMLInputElement).value
    const pass = (document.getElementById('password') as HTMLInputElement).value

    const { error } = await signIn(email, pass)
    setIsLoading(false)

    if (error) {
      toast({ title: 'Erro no login', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Login realizado', description: 'Aguarde a verificação de status...' })
      setTimeout(() => navigate('/restrito'), 1000)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const name = (document.getElementById('reg-name') as HTMLInputElement).value
    const org = (document.getElementById('reg-org') as HTMLInputElement).value
    const email = (document.getElementById('reg-email') as HTMLInputElement).value
    const pass = (document.getElementById('reg-pass') as HTMLInputElement).value

    const { error } = await signUp(email, pass, {
      nome: name,
      organizacao: org,
      nivel_acesso: role,
    })
    setIsLoading(false)

    if (error) {
      toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Cadastro solicitado',
        description: `Sua solicitação para nível "${role || 'Não definido'}" foi enviada para warlenlibrelon@ipt.br.`,
      })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 animate-fade-in-up">
      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl text-primary">Acesso Restrito</CardTitle>
          <CardDescription>Área exclusiva para parceiros e gestores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastre-se</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              {isPending ? (
                <div className="text-center py-6 space-y-4">
                  <h3 className="text-lg font-medium text-amber-600">Aprovação Pendente</h3>
                  <p className="text-muted-foreground">
                    Sua conta foi criada e está aguardando aprovação por um administrador.
                  </p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Atualizar Status
                  </Button>
                </div>
              ) : isRecovering ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setIsLoading(true)
                    const email = (document.getElementById('recovery-email') as HTMLInputElement)
                      .value
                    const { error } = await resetPassword(email)
                    setIsLoading(false)
                    if (error) {
                      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
                    } else {
                      toast({
                        title: 'Sucesso',
                        description: 'Um link de recuperação foi enviado para o seu e-mail.',
                      })
                      setIsRecovering(false)
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email">E-mail</Label>
                    <Input
                      id="recovery-email"
                      type="email"
                      placeholder="nome@organizacao.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Recuperar Senha'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => setIsRecovering(false)}
                  >
                    Voltar para login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="nome@organizacao.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm px-0 h-auto"
                    onClick={() => setIsRecovering(true)}
                  >
                    Esqueci minha senha
                  </Button>
                  <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nome Completo</Label>
                  <Input id="reg-name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-mail Institucional</Label>
                  <Input id="reg-email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-org">Organização</Label>
                  <Input id="reg-org" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-level">Nível de Acesso Desejado</Label>
                  <Select required onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Visualizador Técnico</SelectItem>
                      <SelectItem value="editor">Gestor de Cenários</SelectItem>
                      <SelectItem value="admin">Administrador Institucional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass">Crie uma Senha</Label>
                  <Input id="reg-pass" type="password" required />
                </div>
                <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Solicitar Acesso'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
