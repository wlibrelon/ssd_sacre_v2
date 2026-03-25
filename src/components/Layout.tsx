import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Header } from './Header'
import { AppSidebar } from './AppSidebar'
import { SobreModal } from './SobreModal'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function Layout() {
  const [isSobreOpen, setIsSobreOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 pt-16 h-full">
        <SidebarProvider>
          <AppSidebar onOpenSobre={() => setIsSobreOpen(true)} />
          <SidebarInset className="flex-1 overflow-y-auto w-full relative">
            <main className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <SobreModal open={isSobreOpen} onOpenChange={setIsSobreOpen} />
    </div>
  )
}
