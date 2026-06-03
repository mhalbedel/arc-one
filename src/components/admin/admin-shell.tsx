'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Tag, Store, Inbox, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from '@/components/ui/sonner'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/arcs', label: 'Arcs', icon: Package, exact: false },
  { href: '/admin/shop', label: 'Shop', icon: Store, exact: false },
  { href: '/admin/anfragen', label: 'Anfragen', icon: Inbox, exact: false },
  { href: '/admin/bestellungen', label: 'Bestellungen', icon: ShoppingCart, exact: false },
  { href: '/admin/preismatrix', label: 'Preismatrix', icon: Tag, exact: false },
]

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href)
}

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    // scope 'local': nur diese Browser-Session beenden, nicht das Konto kontoweit
    await supabase.auth.signOut({ scope: 'local' })
    window.location.href = '/admin/login'
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-3 py-4">
          <span className="font-serif text-base tracking-[0.18em] font-medium uppercase">
            ARC-ONE
          </span>
          <span className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
            Admin
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item.href, item.exact)}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 pb-1 text-xs text-muted-foreground truncate">{adminName}</div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <LogOut />
                <span>Abmelden</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
