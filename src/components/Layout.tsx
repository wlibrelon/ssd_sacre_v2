import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Header } from './Header'
import { AppSidebar } from './AppSidebar'
import { SobreModal } from './SobreModal'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

// Rotas que precisam ocupar a área de conteúdo por completo, sem o
// max-width/centralização/padding padrão (ex: a página do mapa, que
// precisa de altura real em 100% e largura total para o mapa funcionar).
const ROTAS_TELA_CHEIA = ['/area-estudo/camadas']

export default function Layout() {
  const [isSobreOpen, setIsSobreOpen] = useState(false)
  const location = useLocation()
  const telaCheia = ROTAS_TELA_CHEIA.includes(location.pathname)

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
        <Header />
        <div className="flex flex-1 pt-16 overflow-hidden">
          <AppSidebar onOpenSobre={() => setIsSobreOpen(true)} />
          <SidebarInset className="flex-1 overflow-y-auto w-full relative bg-background/50">
            <main
              className={
                telaCheia
                  ? 'w-full h-full'
                  : 'w-full h-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in'
              }
            >
              <Outlet />
            </main>
          </SidebarInset>
        </div>
        <SobreModal open={isSobreOpen} onOpenChange={setIsSobreOpen} />
      </div>
    </SidebarProvider>
  )
}
