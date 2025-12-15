"use client";

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, Trees, Users, MapPin, Search } from 'lucide-react';
import { getProyectos, getEstadisticasGlobales } from '@/lib/supabase-v2';

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
  const [searchQuery, setSearchQuery] = useState('');
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

  const cargarEstadisticas = async () => {
    try {
      console.log('🔄 [Proyectos] Cargando estadísticas...');
      
      // Cargar estadísticas desde Supabase
      const { data: estadisticas, error } = await getEstadisticasGlobales();
      
      if (error) {
        console.error('❌ [Proyectos] Error al cargar estadísticas:', error);
        // Fallback a localStorage si falla
        const proyectosData = localStorage.getItem('proyectos') || '[]';
        const proyectos = JSON.parse(proyectosData);
        setStats({
          totalProyectos: proyectos.length,
          arbolesPlantados: 0,
          totalVoluntarios: 0,
        });
        return;
      }
      
      console.log('📊 [Proyectos] Datos recibidos:', estadisticas);
      
      setStats({
        totalProyectos: estadisticas?.total_proyectos || 0,
        arbolesPlantados: estadisticas?.arboles_plantados || 0,
        totalVoluntarios: estadisticas?.voluntarios_unicos || 0,
      });
      
      console.log('✅ [Proyectos] Estadísticas actualizadas:', {
        proyectos: estadisticas?.total_proyectos || 0,
        arboles: estadisticas?.arboles_plantados || 0,
        voluntarios: estadisticas?.voluntarios_unicos || 0
      });
    } catch (error) {
      console.error('❌ [Proyectos] Error al cargar estadísticas:', error);
      // Fallback a valores por defecto
      setStats({
        totalProyectos: 0,
        arbolesPlantados: 0,
        totalVoluntarios: 0,
      });
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

        {/* Barra de búsqueda de proyectos */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') || "Buscar proyectos por nombre, ubicación, descripción..."}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl 
                         bg-white dark:bg-gray-800 text-base shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         text-gray-900 dark:text-white placeholder-gray-500
                         transition-all duration-300"
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                {t('proyectos.buscando') || 'Buscando'}: <span className="font-semibold">{searchQuery}</span>
              </p>
            )}
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
              <MapaProyectos searchQuery={searchQuery} />
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
