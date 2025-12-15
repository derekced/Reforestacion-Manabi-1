"use client";

import { Globe, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import logo from "../assets/logo-reforestacion.png";

export default function Header() {
  const { language, toggleLanguage: toggleLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    toggleLang();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800 shadow-sm">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Sidebar trigger */}
        <SidebarTrigger className="-ml-1 shrink-0" />
        
        {/* Logo y nombre del sistema */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image 
              src={logo} 
              alt="Logo Reforestación" 
              fill
              className="object-contain"
            />
          </div>
          <div className="hidden lg:block max-w-xs">
            <h1 className="text-base lg:text-lg font-bold text-forest-dark dark:text-white whitespace-nowrap truncate">
              Reforesta Manabí
            </h1>
            <p className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap truncate">
              {t('home.badge')}
            </p>
          </div>
        </div>

        {/* Espaciador flexible */}
        <div className="flex-1"></div>

        {/* Controles de idioma y tema */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Toggle de idioma */}
          <button
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg 
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                     text-sm font-medium text-gray-700 dark:text-gray-300
                     relative group"
            title={`${language === "es" ? "Cambiar a Inglés" : "Switch to Spanish"} (Ctrl+Shift+I)`}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden md:inline">
              {language === "es" ? "ES" : "EN"}
            </span>
            <span className="hidden xl:inline text-xs opacity-50 ml-1">⌃⇧I</span>
          </button>

          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg 
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                     text-sm font-medium text-gray-700 dark:text-gray-300
                     relative group"
            title={`${theme === "dark" ? t('sidebar.modoClaro') : t('sidebar.modoOscuro')} (Ctrl+Shift+D)`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="hidden md:inline">
              {theme === "dark" ? t('sidebar.modoClaro') : t('sidebar.modoOscuro')}
            </span>
            <span className="hidden xl:inline text-xs opacity-50 ml-1">⌃⇧D</span>
          </button>

          {/* Menú de accesibilidad */}
          <AccessibilityMenu />
        </div>
      </div>
    </header>
  );
}
