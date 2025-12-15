"use client";

import { useState } from "react";
import { HelpCircle, X, ChevronDown, ChevronUp, Keyboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const helpContent = {
  es: {
    inicio: {
      title: "Bienvenida",
      items: [
        "Diseño limpio y ordenado con texto claro",
        "Mensajes de bienvenida breves y positivos",
        "Estructura fija: cabecera → menú → cuerpo → pie",
        "Sin animaciones automáticas o banners rotativos"
      ]
    },
    cabecera: {
      title: "Cabecera",
      items: [
        "Logo visible en todas las páginas",
        "Nombre del sistema siempre presente",
        "Barra de búsqueda accesible",
        "Idioma (español/inglés) cambiable",
        "Indicador del formulario actual"
      ]
    },
    menu: {
      title: "Menú",
      items: [
        "Lateral expandible con iconos y textos",
        "Atajos de menú visibles",
        "Submenús contextuales por tema/proyecto",
        "Accesibilidad visual (alertas, lectura por voz)",
        "Modo alto contraste disponible"
      ]
    },
    cuerpo: {
      title: "Cuerpo",
      items: [
        "Bienvenida personalizada según usuario",
        "Novedades y noticias relevantes",
        "Ayuda contextual según formulario",
        "Diseño modular y adaptable"
      ]
    },
    pie: {
      title: "Pie de Página",
      items: [
        "Información institucional",
        "Enlaces de soporte y contacto",
        "Política y términos de uso"
      ]
    },
    atajos: {
      title: "Atajos de Teclado",
      items: [
        "Ctrl+H → Inicio",
        "Ctrl+P → Proyectos",
        "Ctrl+E → Estadísticas",
        "Ctrl+Shift+D → Cambiar tema",
        "Ctrl+Shift+I → Cambiar idioma",
        "Ctrl+Shift+B → Toggle sidebar",
        "Alt+Shift+C → Alto contraste",
        "Alt+Shift+T → Texto ampliado",
        "Alt+Shift+V → Lectura por voz"
      ]
    }
  },
  en: {
    inicio: {
      title: "Welcome",
      items: [
        "Clean and organized design with clear text",
        "Brief and positive welcome messages",
        "Fixed structure: header → menu → body → footer",
        "No automatic animations or rotating banners"
      ]
    },
    cabecera: {
      title: "Header",
      items: [
        "Logo visible on all pages",
        "System name always present",
        "Accessible search bar",
        "Language (Spanish/English) switchable",
        "Current form indicator"
      ]
    },
    menu: {
      title: "Menu",
      items: [
        "Expandable sidebar with icons and text",
        "Visible menu shortcuts",
        "Contextual submenus by theme/project",
        "Visual accessibility (alerts, voice reading)",
        "High contrast mode available"
      ]
    },
    cuerpo: {
      title: "Body",
      items: [
        "Personalized welcome by user",
        "Relevant news and updates",
        "Contextual help by form",
        "Modular and adaptable design"
      ]
    },
    pie: {
      title: "Footer",
      items: [
        "Institutional information",
        "Support and contact links",
        "Privacy policy and terms of use"
      ]
    },
    atajos: {
      title: "Keyboard Shortcuts",
      items: [
        "Ctrl+H → Home",
        "Ctrl+P → Projects",
        "Ctrl+E → Statistics",
        "Ctrl+Shift+D → Toggle theme",
        "Ctrl+Shift+I → Toggle language",
        "Ctrl+Shift+B → Toggle sidebar",
        "Alt+Shift+C → High contrast",
        "Alt+Shift+T → Large text",
        "Alt+Shift+V → Voice reading"
      ]
    }
  }
};

export default function ContextualHelp({ section = "inicio" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(["inicio"]);
  const { language } = useLanguage();

  const content = helpContent[language] || helpContent.es;

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => 
      prev.includes(sectionKey) 
        ? prev.filter(s => s !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  return (
    <>
      {/* Botón flotante de ayuda */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full 
                 bg-forest-primary dark:bg-green-600 text-white shadow-xl
                 hover:bg-forest-dark dark:hover:bg-green-700 
                 transition-all duration-300 hover:scale-110
                 flex items-center justify-center group"
        title={language === "es" ? "Ayuda" : "Help"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        )}
      </button>

      {/* Panel de ayuda */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] overflow-y-auto
                      bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
                      animate-in slide-in-from-bottom-5 duration-300">
          <div className="sticky top-0 bg-forest-primary dark:bg-green-700 text-white p-4 rounded-t-2xl">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {language === "es" ? "Ayuda Contextual" : "Contextual Help"}
            </h3>
            <p className="text-sm text-forest-lightest mt-1">
              {language === "es" 
                ? "Criterios de diseño cognitivo" 
                : "Cognitive design criteria"}
            </p>
          </div>

          <div className="p-4 space-y-3">
            {Object.entries(content).map(([key, section]) => (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full p-3 flex items-center justify-between 
                           bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750
                           transition-colors text-left"
                >
                  <span className="font-semibold text-forest-dark dark:text-white">
                    {section.title}
                  </span>
                  {expandedSections.includes(key) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.includes(key) && (
                  <div className="p-3 bg-white dark:bg-gray-900">
                    <ul className="space-y-2">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-forest-primary dark:text-green-400 mt-1 flex-shrink-0">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {language === "es" 
                ? "Mensaje: \"Sesión iniciada correctamente.\"" 
                : "Message: \"Session started successfully.\""}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
