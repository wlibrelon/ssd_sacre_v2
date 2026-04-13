export default function Placeholder({ title = 'Em breve' }: { title?: string }) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 animate-fade-in text-center p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-primary">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        Esta página está em construção. O conteúdo será disponibilizado nas próximas atualizações.
      </p>
    </div>
  )
}
