import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Send } from 'lucide-react'

export const SobreModal = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)
      toast({
        title: 'Mensagem enviada!',
        description: 'Agradecemos o seu contato. Retornaremos em breve.',
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Sobre o Projeto SACRE</DialogTitle>
          <DialogDescription>
            Soluções Integradas de Água para Cidades Resilientes. Preencha o formulário abaixo para
            entrar em contato com nossa equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" required placeholder="João da Silva" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required placeholder="joao@exemplo.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formacao">Formação / Atuação</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academico">Pesquisador / Acadêmico</SelectItem>
                <SelectItem value="gestor">Gestor Público</SelectItem>
                <SelectItem value="privado">Setor Privado</SelectItem>
                <SelectItem value="ong">ONG / Terceiro Setor</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Sua Mensagem</Label>
            <Textarea
              id="mensagem"
              required
              className="min-h-[100px]"
              placeholder="Como podemos ajudar?"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
