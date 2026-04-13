import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  Activity,
  Map as MapIcon,
  FolderKanban,
  Megaphone,
  Info,
  Lock,
  LogOut,
  LogIn,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export const AppSidebar = ({ onOpenSobre }: { onOpenSobre: () => void }) => {
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navGroups = [
    {
      title: 'Institucional',
      icon: Building2,
      items: [
        { title: 'Projeto SACRE', url: '/institucional/projeto' },
        { title: 'Objetivos', url: '/institucional/objetivos' },
        { title: 'Parceiros', url: '/institucional/parceiros' },
        { title: 'Equipe', url: '/institucional/equipe' },
      ],
    },
    {
      title: 'Área de Estudo',
      icon: MapIcon,
      items: [
        { title: 'Contexto', url: '/area-estudo/contexto' },
        { title: 'Objetivos', url: '/area-estudo/objetivos' },
        { title: 'Documentos', url: '/area-estudo/documentos' },
        { title: 'Camadas', url: '/area-estudo/camadas' },
      ],
    },
    {
      title: 'Projetos',
      icon: FolderKanban,
      items: [
        { title: 'Objetivos', url: '/projetos/objetivos' },
        { title: 'Resultados', url: '/projetos/resultados' },
      ],
    },
    {
      title: 'SSD',
      icon: Activity,
      items: [
        { title: 'Cenários', url: '/ssd/cenarios' },
        { title: 'Configurações', url: '/ssd/configuracoes' },
      ],
    },
    {
      title: 'Divulgação',
      icon: Megaphone,
      items: [
        { title: 'Publicações', url: '/divulgacao/publicacoes' },
        { title: 'Mídia', url: '/divulgacao/midia' },
        { title: 'Congressos', url: '/divulgacao/congressos' },
        { title: 'Atividades Sociais', url: '/divulgacao/atividades-sociais' },
      ],
    },
    {
      title: 'Acesso Restrito',
      icon: Lock,
      items: [
        { title: 'Dados dos projetos', url: '/restrito' },
        { title: 'Inclusão de divulgações', url: '/restrito' },
        { title: 'Cadastros', url: '/restrito' },
        { title: 'Configurações', url: '/restrito' },
      ],
    },
  ]

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="top-16 h-[calc(100svh-4rem)] z-40 border-r-border/50 shadow-sm"
    >
      <SidebarContent className="pt-4">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarMenuItem asChild>
              <Collapsible defaultOpen={false}>
                <SidebarMenuButton asChild>
                  <CollapsibleTrigger className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-2 transition-colors data-[state=open]:bg-sidebar-accent/50">
                    <group.icon className="h-4 w-4 mr-2 shrink-0 text-sidebar-foreground" />
                    <span className="truncate font-medium text-sidebar-foreground text-sm">
                      {group.title}
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90 text-muted-foreground" />
                  </CollapsibleTrigger>
                </SidebarMenuButton>
                <CollapsibleContent className="-mt-1">
                  <SidebarMenuSub>
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <Link
                            to={item.url}
                            className="truncate font-medium text-sidebar-foreground"
                          >
                            {item.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onOpenSobre} tooltip="Sobre">
                <Info className="h-4 w-4 shrink-0 text-sidebar-foreground" />
                <span className="truncate font-medium text-sidebar-foreground">Sobre</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-4 space-y-2 bg-sidebar/50">
        <SidebarMenu>
          <SidebarMenuItem>
            {isAuthenticated ? (
              <SidebarMenuButton onClick={logout} tooltip="Sair" className="text-destructive">
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="flex flex-col items-start leading-none truncate">
                  <span>Sair</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full mt-1">
                    {user?.name}
                  </span>
                </span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild isActive={isActive('/auth')} tooltip="Login">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span className="truncate">Login Restrito</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
