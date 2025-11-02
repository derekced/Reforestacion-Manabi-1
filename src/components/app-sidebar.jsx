"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Leaf,
  BarChart3,
  Settings,
  Users,
  LogOut,
  UserCheck,
  Trees,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WidgetImpacto from "@/components/WidgetImpacto";
import WidgetAdmin from "@/components/WidgetAdmin";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(true);
  // `user` is null when no authenticated user exists
  const [user, setUser] = React.useState(null);

  // Datos del sidebar con traducciones dinámicas
  const getNavItems = () => {
    // Items base que siempre se muestran
    const baseItems = [
      {
        title: t('sidebar.inicio'),
        url: "/",
        icon: Home,
      },
      {
        title: t('sidebar.proyectos'),
        url: "/proyectos",
        icon: Leaf,
      },
    ];

    // Items solo para usuarios autenticados (NO admin)
    const userItems = user && user.role !== 'admin' ? [
      {
        title: t('sidebar.estadisticas'),
        url: "/estadisticas",
        icon: BarChart3,
      },
    ] : [];

    // Items para organizadores y administradores
    const controlItems = user && (user.role === 'organizer' || user.role === 'admin') ? [
      {
        title: "Control",
        url: "/control",
        icon: UserCheck,
      },
      {
        title: "Solicitar Proyecto",
        url: "/proyectos/peticion",
        icon: Trees,
      },
    ] : [];

    // Items solo para administradores
    const adminItems = user && user.role === 'admin' ? [
      {
        title: "Admin",
        url: "/admin",
        icon: Settings,
      },
      {
        title: "Peticiones",
        url: "/admin/peticiones",
        icon: Trees,
      },
    ] : [];

    // Items de autenticación (solo si no hay usuario)
    const authItems = [
      {
        title: t('sidebar.acceso'),
        url: "/login",
        icon: LogOut,
      },
      {
        title: t('sidebar.registro'),
        url: "/register",
        icon: Users,
      },
    ];

    return [...baseItems, ...(user ? [...userItems, ...controlItems, ...adminItems] : authItems)];
  };

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setUser(JSON.parse(raw));
      else setUser(null);
    } catch (e) {
      // ignore
      setUser(null);
    } finally {
      setIsLoading(false);
    }
    
    const onAuthChange = () => {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) setUser(JSON.parse(raw));
        else setUser(null);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener("authChange", onAuthChange);
    return () => window.removeEventListener("authChange", onAuthChange);
  }, []);

  // Filter and reorder nav items based on authentication and access
  const navItems = React.useMemo(() => {
    if (isLoading) return [];
    
    const items = getNavItems();
    
    try {
      // If user is authenticated, add profile link
      if (user) {
        return [
          ...items,
          {
            title: t('perfil.titulo'),
            url: "/profile",
            icon: Users,
          }
        ];
      }
    } catch (e) {
      // ignore
    }
    
    return items;
  }, [user, t, isLoading]);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Contenido del Sidebar */}
      <SidebarContent className="bg-forest-dark dark:bg-gray-900 overflow-x-hidden">
        <div className="px-2 py-2">
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="text-forest-lightest/85 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white dark:text-gray-300 dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 transition-all"
                    tooltip={item.title}
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>

        <SidebarSeparator className="bg-white/10 dark:bg-gray-800" />

        {/* Widget - Mostrar widget apropiado según el rol del usuario */}
        {user && (
          <div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
            {user.role === 'admin' ? <WidgetAdmin /> : <WidgetImpacto />}
          </div>
        )}
      </SidebarContent>

      {/* Footer del Sidebar */}
      <SidebarFooter className="bg-forest-dark dark:bg-gray-900 p-3 border-t border-white/10 dark:border-gray-800">
        {/* Usuario: mostrar solo si hay sesión iniciada */}
        {!isLoading && user && <NavUser user={user} />}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
