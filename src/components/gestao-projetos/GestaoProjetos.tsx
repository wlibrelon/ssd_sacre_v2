import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WPsTab } from './WPsTab'
import { ProjetosTab } from './ProjetosTab'
import { ColaboradoresTab } from './ColaboradoresTab'
import { ArtigosTab } from './ArtigosTab'
import { ConfiguracoesTab } from './ConfiguracoesTab'

export function GestaoProjetos() {
  return (
    <div className="w-full">
      <Tabs defaultValue="wps" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-2 bg-secondary/20 p-1">
          <TabsTrigger
            value="wps"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Work Packages
          </TabsTrigger>
          <TabsTrigger
            value="projetos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Projetos
          </TabsTrigger>
          <TabsTrigger
            value="colaboradores"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Colaboradores
          </TabsTrigger>
          <TabsTrigger
            value="artigos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Artigos / Relatórios
          </TabsTrigger>
          <TabsTrigger
            value="configuracoes"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wps" className="mt-0">
          <WPsTab />
        </TabsContent>

        <TabsContent value="projetos" className="mt-0">
          <ProjetosTab />
        </TabsContent>

        <TabsContent value="colaboradores" className="mt-0">
          <ColaboradoresTab />
        </TabsContent>

        <TabsContent value="artigos" className="mt-0">
          <ArtigosTab />
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-0">
          <ConfiguracoesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
