"use client";

import { useState, useEffect } from "react";
import { Eye, Volume2, Type, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AccessibilityMenu() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    visualAlerts: false,
    voiceReading: false,
    largeText: false,
  });

  useEffect(() => {
    // Cargar configuración guardada
    const saved = localStorage.getItem("accessibilitySettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }

    // Escuchar atajos de teclado
    const handleShortcut = (e) => {
      const actionMap = {
        "toggle-text": "largeText",
        "toggle-voice": "voiceReading",
        "toggle-alerts": "visualAlerts",
      };
      
      const settingKey = actionMap[e.detail.action];
      if (settingKey) {
        toggleSetting(settingKey);
      }
    };

    window.addEventListener("accessibility-shortcut", handleShortcut);
    return () => window.removeEventListener("accessibility-shortcut", handleShortcut);
  }, []);

  const applySettings = (newSettings) => {
    // Aplicar texto grande
    if (newSettings.largeText) {
      document.documentElement.classList.add("large-text");
    } else {
      document.documentElement.classList.remove("large-text");
      // Forzar reset completo de estilos y recalculación del layout
      document.documentElement.style.fontSize = '';
      document.body.style.fontSize = '';
      // Forzar reflow
      void document.documentElement.offsetHeight;
      // Forzar repaint
      document.documentElement.style.display = 'none';
      void document.documentElement.offsetHeight;
      document.documentElement.style.display = '';
    }

    // Guardar en localStorage
    localStorage.setItem("accessibilitySettings", JSON.stringify(newSettings));
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    applySettings(newSettings);

    // Anunciar cambio si está activada la lectura por voz
    if (newSettings.voiceReading || key === "voiceReading") {
      announceChange(key, newSettings[key]);
    }
  };

  const announceChange = (setting, enabled) => {
    if (!window.speechSynthesis) return;

    const messages = {
      visualAlerts: enabled ? "Alertas visuales activadas" : "Alertas visuales desactivadas",
      voiceReading: enabled ? "Lectura por voz activada" : "Lectura por voz desactivada",
      largeText: enabled ? "Texto ampliado activado" : "Texto ampliado desactivado",
    };

    const utterance = new SpeechSynthesisUtterance(messages[setting]);
    utterance.lang = "es-ES";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg 
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                   text-sm font-medium text-gray-700 dark:text-gray-300"
          title={t('accessibility.menu') || "Accesibilidad"}
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t('accessibility.menu') || "Accesibilidad"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          {t('accessibility.settings') || "Configuración de Accesibilidad"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Alertas visuales */}
        <DropdownMenuItem
          onClick={() => toggleSetting("visualAlerts")}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{t('accessibility.visualAlerts') || "Alertas visuales"}</span>
            </div>
            {settings.visualAlerts && <Check className="w-4 h-4 text-green-600" />}
          </div>
        </DropdownMenuItem>

        {/* Lectura por voz */}
        <DropdownMenuItem
          onClick={() => toggleSetting("voiceReading")}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>{t('accessibility.voiceReading') || "Lectura por voz"}</span>
            </div>
            {settings.voiceReading && <Check className="w-4 h-4 text-green-600" />}
          </div>
        </DropdownMenuItem>

        {/* Texto ampliado */}
        <DropdownMenuItem
          onClick={() => toggleSetting("largeText")}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>{t('accessibility.largeText') || "Texto ampliado"}</span>
            </div>
            {settings.largeText && <Check className="w-4 h-4 text-green-600" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
