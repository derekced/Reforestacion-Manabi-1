"use client";

import * as React from "react";
import {
  BookOpen,
  Home,
  Leaf,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Datos para Reforesta Manabí
const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Proyectos",
      url: "#proyectos",
      icon: Leaf,
    },
    {
      title: "Estadísticas",
      url: "#estadisticas",
      icon: BarChart3,
    },
    {
      title: "Voluntarios",
      url: "#voluntarios",
      icon: Users,
    },
    {
      title: "Recursos",
      url: "#recursos",
      icon: BookOpen,
    },
    {
      title: "Configuración",
      url: "#configuracion",
      icon: Settings,
    },
    {
      title: "Acceso",
      url: "/login",
      icon: LogOut,
    },
    {
      title: "Registro",
      url: "/register",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  // `user` is null when no authenticated user exists
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setUser(JSON.parse(raw));
      else setUser(null);
    } catch (e) {
      // ignore
      setUser(null);
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
    const items = [...data.navMain];
    try {
      // If user is authenticated, remove login/register links and add profile
      if (user) {
        const filteredItems = items.filter(item => 
          !['Acceso', 'Registro'].includes(item.title)
        );
        return [
          ...filteredItems,
          {
            title: "Mi Perfil",
            url: "/profile",
            icon: Users,
            isActive: false,
          }
        ];
      }

      // If user has special access, reorder access link
      const hasAccess =
        user && (user.access === "accesoPRIN" || (user.roles || []).includes("accesoPRIN"));
      if (hasAccess) {
        const idx = items.findIndex((i) => i.title === "Acceso");
        if (idx > -1) {
          const [it] = items.splice(idx, 1);
          items.unshift(it);
        }
      }
    } catch (e) {
      // ignore
    }
    return items;
  }, [user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Contenido del Sidebar */}
      <SidebarContent className="bg-forest-dark dark:bg-gray-900 overflow-x-hidden">
        <div className="px-2 py-2">
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  className="text-forest-lightest/85 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white dark:text-gray-300 dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 transition-all"
                  tooltip={item.title}
                >
                  <a href={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <SidebarSeparator className="bg-white/10 dark:bg-gray-800" />

        {/* Estadísticas de Impacto */}
        <div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
          <div className="rounded-xl border border-white/10 bg-white/10 dark:bg-white/5 dark:border-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-forest-lightest/70 dark:text-gray-400">
                  Tu impacto
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  153 árboles
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-primary/30 dark:bg-green-600/30">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-forest-lightest/75 dark:text-gray-400">
              Faltan{" "}
              <span className="font-semibold text-white">47 árboles</span> para
              tu meta semanal.
            </p>
          </div>
        </div>
      </SidebarContent>

      {/* Footer del Sidebar */}
      <SidebarFooter className="bg-forest-dark dark:bg-gray-900 p-3 border-t border-white/10 dark:border-gray-800">
        {/* Toggle de Dark Mode */}
        <div className="mb-2 group-data-[collapsible=icon]:mb-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 text-forest-lightest dark:text-gray-300"
                tooltip={theme === "dark" ? "Modo claro" : "Modo oscuro"}
              >
                {mounted && (
                  <>
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    <span className="group-data-[collapsible=icon]:hidden">
                      {theme === "dark" ? "Modo claro" : "Modo oscuro"}
                    </span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        {/* Usuario: mostrar solo si hay sesión iniciada */}
        {user ? (
          <NavUser user={user} />
        ) : (
          <div className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full text-forest-lightest/85 hover:bg-white/10 hover:text-white dark:text-gray-300">
                  <a href="/login" className="w-full text-left">Acceder</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
