"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Mapa de atajos de teclado
const shortcuts = {
  // Navegación principal
  "ctrl+h": "/", // Home
  "ctrl+p": "/proyectos", // Proyectos
  "ctrl+e": "/estadisticas", // Estadísticas
  "ctrl+l": "/login", // Login
  "ctrl+shift+r": "/register", // Register
  
  // Admin
  "ctrl+shift+a": "/admin", // Admin panel
  "ctrl+shift+c": "/control", // Control
  "ctrl+shift+v": "/voluntarios", // Voluntarios
  
  // Funcionalidades
  "ctrl+shift+b": "toggle-sidebar", // Toggle sidebar
  "ctrl+shift+d": "toggle-theme", // Toggle dark mode
  "ctrl+shift+i": "toggle-language", // Toggle language
  "ctrl+shift+h": "toggle-help", // Toggle help
  
  // Accesibilidad
  "alt+shift+t": "toggle-text", // Texto ampliado
  "alt+shift+v": "toggle-voice", // Lectura por voz
  "alt+shift+a": "toggle-alerts", // Alertas visuales
};

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = [];
      if (e.ctrlKey) key.push("ctrl");
      if (e.shiftKey) key.push("shift");
      if (e.altKey) key.push("alt");
      if (e.key) key.push(e.key.toLowerCase());
      
      const combo = key.join("+");
      const action = shortcuts[combo];

      if (action) {
        e.preventDefault();
        
        // Navegación
        if (action.startsWith("/")) {
          router.push(action);
        }
        // Acciones especiales
        else {
          switch (action) {
            case "toggle-sidebar":
              const sidebarButton = document.querySelector('[data-sidebar-trigger]');
              if (sidebarButton) sidebarButton.click();
              break;
              
            case "toggle-theme":
              const themeButton = document.querySelector('[aria-label="Toggle theme"]');
              if (themeButton) themeButton.click();
              break;
              
            case "toggle-language":
              const langButton = document.querySelector('[aria-label="Toggle language"]');
              if (langButton) langButton.click();
              break;
              
            case "toggle-help":
              const helpButton = document.querySelector('[aria-label="Ayuda"]');
              if (helpButton) helpButton.click();
              break;
              
            case "toggle-text":
            case "toggle-voice":
            case "toggle-alerts":
              // Disparar evento personalizado para el menú de accesibilidad
              window.dispatchEvent(new CustomEvent('accessibility-shortcut', { 
                detail: { action } 
              }));
              break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);

  return null;
}

// Hook para mostrar los atajos disponibles
export function useKeyboardShortcuts() {
  return shortcuts;
}
