import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      login({ name: 'Usuário Teste', email: 'teste@sacre.org', role: 'admin' })
      setIsLoading(false)
      navigate('/restrito')
      toast({ title: 'Login bem-sucedido', description: 'Bem-vindo à área restrita.' })
    }, 1000)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({ title: 'Cadastro solicitado', description: 'Seu pedido de acesso está em análise.' })
    }, 1500)
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
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="nome@organizacao.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
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
                  <Select required>
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
