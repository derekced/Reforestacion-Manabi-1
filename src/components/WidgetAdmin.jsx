"use client";

import { useState, useEffect } from 'react';
import { Trees, Calendar, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cargarProyectos } from '@/lib/proyectosUtils';

export default function WidgetAdmin() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalProyectos: 0,
    proyectosActivos: 0,
    totalVoluntarios: 0,
  });

  useEffect(() => {
    cargarEstadisticas();
    
    const handleStorageChange = () => {
      cargarEstadisticas();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('projectsChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectsChange', handleStorageChange);
    };
  }, []);

  const cargarEstadisticas = () => {
    try {
      const proyectos = cargarProyectos();
      if (proyectos && proyectos.length > 0) {
        const activos = proyectos.filter(p => p.estado === 'Activo').length;
        
        // Calcular total de voluntarios sumando de todos los proyectos
        const totalVol = proyectos.reduce((sum, p) => sum + (p.voluntarios || 0), 0);
        
        setStats({
          totalProyectos: proyectos.length,
          proyectosActivos: activos,
          totalVoluntarios: totalVol,
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/10 dark:bg-white/5 dark:border-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-forest-lightest/70 dark:text-gray-400">
            {t('widgetAdmin.panel')}
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {stats.totalProyectos} {t('widgetAdmin.proyectos')}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-primary/30 dark:bg-green-600/30">
          <Trees className="h-5 w-5 text-white" />
        </div>
      </div>
      
      <div className="space-y-2 text-xs text-forest-lightest/75 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>
            <span className="font-semibold text-white">{stats.proyectosActivos}</span> {t('widgetAdmin.activos')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>
            <span className="font-semibold text-white">{stats.totalVoluntarios}</span> {t('widgetAdmin.voluntarios')}
          </span>
        </div>
      </div>
    </div>
  );
}
