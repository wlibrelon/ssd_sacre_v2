import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'  // +Header/Title pra Cards

export default function Projeto() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-4">Projeto SACRE</h1>
        <div className="w-20 h-1.5 bg-secondary mb-6 rounded-full" />
        {/* Seus 3 primeiros <p> mantidos... */}
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg border border-border">
        <img src="https://img.usecurling.com/p/800/400?q=river%20city" alt="Visão geral do projeto" className="w-full h-[300px] object-cover" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3 text-primary">Nossa Missão</h3>
            <p className="text-muted-foreground">...</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3 text-primary">Abordagem</h3>
            <p className="text-muted-foreground">...</p>
          </CardContent>
        </Card>
      </div>

      {/* Textos finais em Card pra estrutura consistente */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary mb-2">Detalhes do Projeto</CardTitle>
          <div className="w-20 h-1.5 bg-secondary rounded-full" />
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <p className="text-lg text-muted-foreground leading-relaxed text-justify">
            O desenvolvimento de métodos... (seus 5 <p> aqui, com mb-4 entre eles)
          </p>
          {/* ... resto dos <p> ... */}
        </CardContent>
      </Card>
    </div>  // ← Único fechamento necessário pro #1
  )
}