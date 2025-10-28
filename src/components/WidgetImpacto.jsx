"use client";

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WidgetImpacto() {
  const { t } = useLanguage();
  const [metaSemanal, setMetaSemanal] = useState(200);
  const [arbolesPlantados, setArbolesPlantados] = useState(0);

  useEffect(() => {
    cargarDatos();
    
    const handleRegistrationChange = () => {
      cargarDatos();
    };

    const handleAsistenciaChange = () => {
      cargarDatos();
    };
    
    window.addEventListener('registrationChange', handleRegistrationChange);
    window.addEventListener('asistenciaChange', handleAsistenciaChange);
    window.addEventListener('storage', handleAsistenciaChange);
    
    return () => {
      window.removeEventListener('registrationChange', handleRegistrationChange);
      window.removeEventListener('asistenciaChange', handleAsistenciaChange);
      window.removeEventListener('storage', handleAsistenciaChange);
    };
  }, []);

  const cargarDatos = () => {
    try {
      // Cargar meta semanal
      const savedMeta = localStorage.getItem('metaSemanal');
      if (savedMeta) {
        setMetaSemanal(parseInt(savedMeta));
      }

      // Obtener usuario actual
      const authUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
      if (!authUser) return;

      const user = JSON.parse(authUser);

      // Cargar asistencias registradas del usuario
      const asistenciasData = localStorage.getItem('asistencias');
      if (asistenciasData) {
        const asistencias = JSON.parse(asistenciasData);
        const userAsistencias = asistencias.filter(a => a.userEmail === user.email);
        
        // Calcular total de árboles plantados
        const totalPlantados = userAsistencias.reduce((sum, asistencia) => {
          return sum + (Number.parseInt(asistencia.arbolesPlantados, 10) || 0);
        }, 0);
        
        setArbolesPlantados(totalPlantados);
      } else {
        setArbolesPlantados(0);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const arbolesRestantes = Math.max(metaSemanal - arbolesPlantados, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/10 dark:bg-white/5 dark:border-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-forest-lightest/70 dark:text-gray-400">
            {t('widgetImpacto.tuImpacto')}
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {arbolesPlantados} {t('widgetImpacto.arboles')}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-primary/30 dark:bg-green-600/30">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-forest-lightest/75 dark:text-gray-400">
        {t('widgetImpacto.faltan')}{" "}
        <span className="font-semibold text-white">{arbolesRestantes} {t('widgetImpacto.arboles')}</span>{" "}
        {t('widgetImpacto.paraMeta')}.
      </p>
    </div>
  );
}
