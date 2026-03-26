import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  Activity,
  BarChart2,
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
  SidebarGroupLabel,
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
        { title: 'Work Package', url: '/resultados/1' },
        { title: 'Cidade Bauru', url: '/institucional/bauru' },
        { title: 'Desafios', url: '/institucional/desafios' },
        { title: 'Equipe', url: '/institucional/equipe' },
      ],
    },
    {
      title: 'Sistema de Suporte a Decisão',
      icon: Activity,
      items: [
        { title: 'Cenários', url: '/ssd/cenarios' },
        { title: 'Configurações', url: '/ssd/configuracoes' },
      ],
    },
    {
      title: 'Resultados dos projetos',
      icon: BarChart2,
      items: Array.from({ length: 6 }).map((_, i) => ({
        title: `Work Package ${i + 1}`,
        url: `/resultados/${i + 1}`,
      })),
    },
    {
      title: 'Divulgação',
      icon: Megaphone,
      items: [
        { title: 'Publicações', url: '/divulgacao/publicacoes' },
        { title: 'Mídia', url: '/divulgacao/midia' },
        { title: 'Congressos', url: '/divulgacao/congressos' },
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
          <Collapsible key={group.title} defaultOpen={false} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-2 cursor-pointer transition-colors">
                  <group.icon className="h-4 w-4 mr-2 shrink-0 text-primary/80" />
                  <span className="truncate font-medium text-sidebar-foreground text-base">
                    {group.title}
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90 text-muted-foreground" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenuSub className="mt-1">
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
            </SidebarGroup>
          </Collapsible>
        ))}

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onOpenSobre} tooltip="Sobre o Projeto">
                <Info className="h-4 w-4 shrink-0 text-secondary" />
                <span className="truncate font-medium text-sidebar-foreground">Fale Conosco</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-4 space-y-2 bg-sidebar/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/restrito')} tooltip="Acesso Restrito">
              <Link
                to="/restrito"
                className={cn('font-medium transition-colors', isAuthenticated && 'text-secondary')}
              >
                <Lock className="h-4 w-4 shrink-0" />
                <span className="truncate">Acesso Restrito</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

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
                  <span className="truncate">Login</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
