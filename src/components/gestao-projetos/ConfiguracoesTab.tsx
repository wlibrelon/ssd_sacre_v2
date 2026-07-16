import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CatalogoSimples } from './CatalogoSimples'

// Catálogos simples (id + descrição) gerenciáveis aqui. Pra adicionar um novo
// (ex: fonte_agua, tipos_cenarios, acoes...), basta incluir uma entrada seguindo
// o mesmo padrão — o CatalogoSimples cuida do CRUD genericamente.
const CATALOGOS = [
  {
    value: 'tipo_artigo',
    label: 'Tipos de Artigo',
    tabela: 'tipo_artigo',
    idField: 'id_tipo',
    descField: 'descricao',
  },
]

export function ConfiguracoesTab() {
  return (
    <div className="animate-fade-in-up">
      <Tabs defaultValue={CATALOGOS[0].value} className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto gap-2 bg-secondary/10 p-1">
          {CATALOGOS.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {CATALOGOS.map((c) => (
          <TabsContent key={c.value} value={c.value} className="mt-0">
            <CatalogoSimples
              tabela={c.tabela}
              idField={c.idField}
              descField={c.descField}
              label={c.label}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
