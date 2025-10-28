"use client";

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, Trees, Users, MapPin } from 'lucide-react';

// Importar el mapa de forma dinámica para evitar problemas de SSR
const MapaProyectos = dynamic(
  () => import('@/components/proyectos/MapaProyectos'),
  { 
    ssr: false,
    loading: () => {
      // Necesitamos acceder a las traducciones aquí
      const LoadingComponent = () => {
        const { t } = useLanguage();
        return (
          <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('proyectos.cargandoMapa')}</p>
            </div>
          </div>
        );
      };
      return <LoadingComponent />;
    }
  }
);

function ProyectosPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalProyectos: 0,
    arbolesPlantados: 0,
    totalVoluntarios: 0,
  });

  useEffect(() => {
    cargarEstadisticas();
    
    const handleStorageChange = () => {
      cargarEstadisticas();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('projectsChange', handleStorageChange);
    window.addEventListener('registrationChange', handleStorageChange);
    window.addEventListener('asistenciaChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectsChange', handleStorageChange);
      window.removeEventListener('registrationChange', handleStorageChange);
      window.removeEventListener('asistenciaChange', handleStorageChange);
    };
  }, []);

  const cargarEstadisticas = () => {
    try {
      // 1. Total de proyectos
      const proyectosData = localStorage.getItem('proyectos');
      const proyectos = proyectosData ? JSON.parse(proyectosData) : [];
      
      // 2. Árboles plantados REALES (de asistencias)
      const asistenciasData = localStorage.getItem('asistencias');
      const asistencias = asistenciasData ? JSON.parse(asistenciasData) : [];
      const totalArboles = asistencias.reduce((sum, asistencia) => {
        return sum + (Number.parseInt(asistencia.arbolesPlantados, 10) || 0);
      }, 0);
      
      // 3. Total de voluntarios únicos que se registraron a proyectos
      const registrosData = localStorage.getItem('eventRegistrations');
      const registros = registrosData ? JSON.parse(registrosData) : [];
      
      // Obtener emails únicos de usuarios registrados
      const voluntariosUnicos = new Set(registros.map(r => r.userEmail));
      
      setStats({
        totalProyectos: proyectos.length,
        arbolesPlantados: totalArboles,
        totalVoluntarios: voluntariosUnicos.size,
      });
      
      console.log('Estadísticas cargadas:', {
        proyectos: proyectos.length,
        arboles: totalArboles,
        voluntarios: voluntariosUnicos.size
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Header mejorado con degradado */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <div className="bg-linear-to-r from-green-600 to-emerald-500 text-white p-4 rounded-2xl shadow-lg">
              <Trees className="w-12 h-12" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-green-700 via-green-600 to-emerald-600 dark:from-green-400 dark:via-green-300 dark:to-emerald-400 bg-clip-text text-transparent mb-4">
            {t('proyectos.titulo')}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {t('proyectos.descripcion')}
          </p>
        </div>

        {/* Estadísticas destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-linear-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium opacity-90">{t('proyectos.totalDe')}</p>
                  <p className="text-xs opacity-75">{t('proyectos.proyectos')}</p>
                </div>
              </div>
              <p className="text-5xl font-bold mt-2">{stats.totalProyectos}</p>
              <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Trees className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium opacity-90">{t('proyectos.arboles')}</p>
                  <p className="text-xs opacity-75">{t('proyectos.plantados')}</p>
                </div>
              </div>
              <p className="text-5xl font-bold mt-2">{stats.arbolesPlantados.toLocaleString()}</p>
              <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-linear-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium opacity-90">{t('proyectos.totalDe')}</p>
                  <p className="text-xs opacity-75">{t('proyectos.voluntarios')}</p>
                </div>
              </div>
              <p className="text-5xl font-bold mt-2">{stats.totalVoluntarios}</p>
              <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa con diseño mejorado */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <MapPin className="w-7 h-7" strokeWidth={2.5} />
              {t('proyectos.mapaInteractivo')}
            </h2>
            <p className="text-green-50 text-sm mt-1">
              {t('proyectos.hacClicMarcadores')}
            </p>
          </div>
          <div className="p-6">
            <Suspense fallback={<div>{t('proyectos.cargando')}</div>}>
              <MapaProyectos />
            </Suspense>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function ProyectosPageWrapper() {
  return (
    <ProtectedRoute>
      <ProyectosPage />
    </ProtectedRoute>
  );
}

export default ProyectosPageWrapper;
