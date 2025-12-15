"use client";

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAsistenciasUsuario, getCurrentUser } from '@/lib/supabase-v2';

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

  const cargarDatos = async () => {
    try {
      console.log('🔄 [WidgetImpacto] Cargando datos...');
      
      // Cargar meta semanal (mantener en localStorage - es preferencia de usuario)
      const savedMeta = localStorage.getItem('metaSemanal');
      if (savedMeta) {
        setMetaSemanal(parseInt(savedMeta));
      }

      // Obtener usuario actual
      const user = await getCurrentUser();
      console.log('👤 [WidgetImpacto] Usuario:', user ? 'Autenticado' : 'No autenticado');
      
      if (!user) {
        console.log('⚠️ [WidgetImpacto] No hay usuario autenticado');
        setArbolesPlantados(0);
        return;
      }

      // Determinar el userId (puede venir de diferentes fuentes)
      const userId = user.id || user.profile?.id || user.email;
      console.log('🆔 [WidgetImpacto] userId:', userId);
      
      if (!userId) {
        console.log('⚠️ [WidgetImpacto] No se pudo determinar userId');
        setArbolesPlantados(0);
        return;
      }

      // Cargar asistencias con el userId
      const { data, error } = await getAsistenciasUsuario(userId);
      
      if (error) {
        console.error('❌ [WidgetImpacto] Error al cargar asistencias:', error);
        setArbolesPlantados(0);
        return;
      }

      console.log('✅ [WidgetImpacto] Asistencias cargadas:', data?.length || 0);
      console.log('📊 [WidgetImpacto] Detalle asistencias:', data);

      // Calcular total de árboles plantados
      const totalPlantados = (data || []).reduce((sum, asistencia) => {
        const arboles = asistencia.arboles_plantados || 0;
        console.log(`  - Asistencia: ${arboles} árboles`);
        return sum + arboles;
      }, 0);
      
      console.log('🌳 [WidgetImpacto] Total árboles plantados:', totalPlantados);
      setArbolesPlantados(totalPlantados);
    } catch (error) {
      console.error('❌ [WidgetImpacto] Error al cargar datos:', error);
      setArbolesPlantados(0);
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
