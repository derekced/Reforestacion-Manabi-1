"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, Volume2, Type, Check, Keyboard } from "lucide-react";
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
    showShortcuts: true,
  });

  // Referencias para los event handlers
  const voiceHoverHandlerRef = useRef(null);
  const voiceFocusHandlerRef = useRef(null);

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
    
    // Cleanup al desmontar
    return () => {
      window.removeEventListener("accessibility-shortcut", handleShortcut);
      // Asegurar que se deshabilita lectura por voz al desmontar
      if (voiceHoverHandlerRef.current) {
        document.removeEventListener('mouseover', voiceHoverHandlerRef.current, true);
      }
      if (voiceFocusHandlerRef.current) {
        document.removeEventListener('focusin', voiceFocusHandlerRef.current, true);
      }
      window.speechSynthesis?.cancel();
    };
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

    // Aplicar lectura por voz
    if (newSettings.voiceReading) {
      document.documentElement.classList.add("voice-reading-enabled");
      enableVoiceReading();
    } else {
      document.documentElement.classList.remove("voice-reading-enabled");
      disableVoiceReading();
    }

    // Guardar en localStorage
    localStorage.setItem("accessibilitySettings", JSON.stringify(newSettings));
    
    // Disparar evento para notificar otros componentes
    window.dispatchEvent(new Event('accessibility-changed'));
  };

  const enableVoiceReading = () => {
    // Crear handlers y guardar referencias
    voiceHoverHandlerRef.current = handleVoiceHover;
    voiceFocusHandlerRef.current = handleVoiceFocus;
    
    // Agregar eventos de hover para leer elementos interactivos
    document.addEventListener('mouseover', voiceHoverHandlerRef.current, true);
    document.addEventListener('focusin', voiceFocusHandlerRef.current, true);
  };

  const disableVoiceReading = () => {
    // Remover usando las referencias guardadas
    if (voiceHoverHandlerRef.current) {
      document.removeEventListener('mouseover', voiceHoverHandlerRef.current, true);
      voiceHoverHandlerRef.current = null;
    }
    if (voiceFocusHandlerRef.current) {
      document.removeEventListener('focusin', voiceFocusHandlerRef.current, true);
      voiceFocusHandlerRef.current = null;
    }
    
    // Detener cualquier lectura activa
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleVoiceHover = (e) => {
    const target = e.target;
    
    // Solo leer elementos interactivos o con contenido relevante
    if (
      target.matches('button, a, h1, h2, h3, h4, h5, h6, [role="button"], [role="link"], input, select, textarea')
    ) {
      const text = getElementText(target);
      if (text) {
        speakText(text);
      }
    }
  };

  const handleVoiceFocus = (e) => {
    const target = e.target;
    const text = getElementText(target);
    if (text) {
      speakText(text);
    }
  };

  const getElementText = (element) => {
    // Priorizar aria-label, luego alt, luego title, luego contenido
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('alt') ||
      element.getAttribute('title') ||
      element.textContent?.trim() ||
      element.value
    );
  };

  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;
    
    // Cancelar lectura anterior
    window.speechSynthesis.cancel();
    
    // Crear nueva lectura
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
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
            {settings.voiceReading && <Check className="w-4 h-4 text-green-600 dark:text-green-500" />}
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
            {settings.largeText && <Check className="w-4 h-4 text-green-600 dark:text-green-500" />}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Mostrar atajos de teclado */}
        <DropdownMenuItem
          onClick={() => toggleSetting("showShortcuts")}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <span>{t('accessibility.showShortcuts') || "Mostrar atajos de teclado"}</span>
            </div>
            {settings.showShortcuts && <Check className="w-4 h-4 text-green-600 dark:text-green-500" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
