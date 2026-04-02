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
    // ... seus grupos mantidos iguais
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
            {/* FIX: SidebarMenuItem + SidebarMenuButton asChild → aplica CSS collapsed */}
            <SidebarMenuItem asChild>
              <Collapsible defaultOpen={false}>
                <SidebarMenuButton asChild>
                  <CollapsibleTrigger className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-2 transition-colors data-[state=open]:bg-sidebar-accent/50">
                    <group.icon className="h-4 w-4 mr-2 shrink-0 text-sidebar-foreground" />{' '}
                    {/* Removido text-white, herda tema */}
                    <span className="truncate font-medium text-sidebar-foreground text-base">
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

        {/* Fale Conosco mantido */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onOpenSobre} tooltip="Fale Conosco">
                <Info className="h-4 w-4 shrink-0 text-sidebar-foreground" />
                <span className="truncate font-medium text-sidebar-foreground">Fale Conosco</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer mantido */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-4 space-y-2 bg-sidebar/50">
        {/* ... igual ... */}
      </SidebarFooter>
    </Sidebar>
  )
}
