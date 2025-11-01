"use client";

import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, TreePine, Award, TrendingUp, MapPin, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalProyectos: 0,
    totalRegistros: 0,
    totalVoluntariosUnicos: 0,
    totalAsistencias: 0,
    arbolesPlantadosReales: 0,
    proyectosActivos: 0,
    proyectosProximos: 0,
    proyectosCompletados: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    cargarEstadisticas();
    
    const handleUpdate = () => {
      cargarEstadisticas();
    };
    
    globalThis.window.addEventListener('storage', handleUpdate);
    globalThis.window.addEventListener('projectsChange', handleUpdate);
    globalThis.window.addEventListener('registrationChange', handleUpdate);
    globalThis.window.addEventListener('asistenciaChange', handleUpdate);
    
    return () => {
      globalThis.window.removeEventListener('storage', handleUpdate);
      globalThis.window.removeEventListener('projectsChange', handleUpdate);
      globalThis.window.removeEventListener('registrationChange', handleUpdate);
      globalThis.window.removeEventListener('asistenciaChange', handleUpdate);
    };
  }, []);

  const cargarEstadisticas = () => {
    try {
      // Proyectos
      const proyectosData = localStorage.getItem('proyectos');
      const proyectos = proyectosData ? JSON.parse(proyectosData) : [];
      
      // Registros
      const registrosData = localStorage.getItem('eventRegistrations');
      const registros = registrosData ? JSON.parse(registrosData) : [];
      
      // Asistencias
      const asistenciasData = localStorage.getItem('asistencias');
      const asistencias = asistenciasData ? JSON.parse(asistenciasData) : [];
      
      // Voluntarios únicos
      const voluntariosUnicos = new Set(registros.map(r => r.userEmail));
      
      // Árboles plantados reales
      const totalArboles = asistencias.reduce((sum, a) => {
        return sum + (Number.parseInt(a.arbolesPlantados, 10) || 0);
      }, 0);
      
      // Contar proyectos por estado
      const activos = proyectos.filter(p => p.estado === 'Activo').length;
      const proximos = proyectos.filter(p => p.estado === 'Próximo').length;
      const completados = proyectos.filter(p => p.estado === 'Completado').length;
      
      setStats({
        totalProyectos: proyectos.length,
        totalRegistros: registros.length,
        totalVoluntariosUnicos: voluntariosUnicos.size,
        totalAsistencias: asistencias.length,
        arbolesPlantadosReales: totalArboles,
        proyectosActivos: activos,
        proyectosProximos: proximos,
        proyectosCompletados: completados,
      });
      
      // Actividad reciente (últimos 10 registros)
      const actividadReciente = registros
        .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          tipo: 'registro',
          usuario: r.userName || r.userEmail,
          proyecto: r.evento?.nombre || 'Proyecto',
          fecha: r.fechaRegistro,
        }));
      
      setRecentActivity(actividadReciente);
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('adminDashboard.titulo')}</h2>
            <p className="text-green-100">{t('adminDashboard.subtitulo')}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Proyectos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalProyectos}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.totalProyectos')}</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-green-600 dark:text-green-400">✓ {stats.proyectosActivos} {t('adminDashboard.activos')}</span>
            <span className="text-orange-600 dark:text-orange-400">◷ {stats.proyectosProximos} {t('adminDashboard.proximos')}</span>
          </div>
        </div>

        {/* Voluntarios Únicos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalVoluntariosUnicos}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.voluntariosActivos')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {stats.totalRegistros} {t('adminDashboard.registrosTotales')}
          </p>
        </div>

        {/* Asistencias Confirmadas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalAsistencias}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.asistenciasRegistradas')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {t('adminDashboard.participacionesConfirmadas')}
          </p>
        </div>

        {/* Árboles Plantados */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <TreePine className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.arbolesPlantadosReales.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.arbolesPlantados')}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>{t('adminDashboard.impactoReal')}</span>
          </div>
        </div>
      </div>

      {/* Distribución de Proyectos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
          {t('adminDashboard.distribucionProyectos')}
        </h3>
        <div className="space-y-3">
          {/* Activos */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.proyectosActivos')}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.proyectosActivos} ({stats.totalProyectos > 0 ? Math.round((stats.proyectosActivos / stats.totalProyectos) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalProyectos > 0 ? (stats.proyectosActivos / stats.totalProyectos) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Próximos */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.proyectosProximos')}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.proyectosProximos} ({stats.totalProyectos > 0 ? Math.round((stats.proyectosProximos / stats.totalProyectos) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalProyectos > 0 ? (stats.proyectosProximos / stats.totalProyectos) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Completados */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.proyectosCompletados')}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {stats.proyectosCompletados} ({stats.totalProyectos > 0 ? Math.round((stats.proyectosCompletados / stats.totalProyectos) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalProyectos > 0 ? (stats.proyectosCompletados / stats.totalProyectos) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
          {t('adminDashboard.actividadReciente')}
        </h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((actividad) => (
              <div 
                key={actividad.id} 
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="shrink-0">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {actividad.usuario}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {t('adminDashboard.seRegistroEn')} {actividad.proyecto}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 shrink-0">
                  {formatDate(actividad.fecha)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('adminDashboard.noHayActividad')}</p>
          </div>
        )}
      </div>

      {/* Acceso rápido */}
      <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-green-200 dark:border-green-900">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">{t('adminDashboard.accesoRapido')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="/admin"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500"
          >
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{t('adminDashboard.gestionarProyectos')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('adminDashboard.crearEditar')}</p>
            </div>
          </a>
          
          <a
            href="/voluntarios"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500"
          >
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{t('adminDashboard.verVoluntarios')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('adminDashboard.listaCompleta')}</p>
            </div>
          </a>
          
          <a
            href="/admin"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
          >
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{t('adminDashboard.asistencias')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('adminDashboard.gestionarRegistros')}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
