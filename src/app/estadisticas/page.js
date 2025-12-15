"use client";

import { useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TrendingUp, Target, Award, Calendar, TreePine, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrentUser } from '@/lib/supabase-v2';

function EstadisticasPage() {
  const { t } = useLanguage();
  const [metaSemanal, setMetaSemanal] = useState(200);
  const [arbolesPlantados, setArbolesPlantados] = useState(0);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [tempMeta, setTempMeta] = useState(200);
  const [registros, setRegistros] = useState([]);
  const [user, setUser] = useState(null);

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
      console.log('🔄 [Estadísticas] Cargando datos...');
      
      // Cargar usuario desde Supabase Auth
      const userData = await getCurrentUser();
      if (!userData) {
        console.log('⚠️ [Estadísticas] No hay usuario autenticado');
        return;
      }
      
      const userRole = userData.profile?.role || userData.user_metadata?.role || 'volunteer';
      const currentUser = {
        email: userData.email,
        role: userRole,
        nombre: userData.profile?.nombre || userData.user_metadata?.nombre || userData.email
      };
      setUser(currentUser);
      
      const userId = userData.id || userData.profile?.id;
      console.log('👤 [Estadísticas] Usuario:', currentUser.nombre, 'ID:', userId);

      // Cargar meta semanal (esto sigue en localStorage - preferencia personal)
      const savedMeta = localStorage.getItem('metaSemanal');
      if (savedMeta) {
        const meta = Number.parseInt(savedMeta);
        setMetaSemanal(meta);
        setTempMeta(meta);
      }

      // Importar funciones de Supabase
      const { getRegistrosUsuario, getAsistenciasUsuario } = await import('@/lib/supabase-v2');

      // Cargar registros del usuario desde Supabase
      const { data: registrosData, error: errorRegistros } = await getRegistrosUsuario(userId);
      
      if (errorRegistros) {
        console.error('❌ [Estadísticas] Error al cargar registros:', errorRegistros);
      } else {
        console.log('✅ [Estadísticas] Registros cargados:', registrosData?.length || 0);
        setRegistros(registrosData || []);
      }
      
      // Cargar asistencias confirmadas desde Supabase
      const { data: asistenciasData, error: errorAsistencias } = await getAsistenciasUsuario(userId);
      
      if (errorAsistencias) {
        console.error('❌ [Estadísticas] Error al cargar asistencias:', errorAsistencias);
        setArbolesPlantados(0);
      } else {
        // Sumar todos los árboles plantados de asistencias confirmadas
        const totalArbolesPlantados = (asistenciasData || []).reduce((sum, asistencia) => {
          const arboles = asistencia.arboles_plantados || 0;
          console.log(`  - Asistencia: ${arboles} árboles`);
          return sum + arboles;
        }, 0);
        
        console.log('🌳 [Estadísticas] Total árboles plantados:', totalArbolesPlantados);
        setArbolesPlantados(totalArbolesPlantados);
      }
    } catch (error) {
      console.error('❌ [Estadísticas] Error al cargar datos:', error);
    }
  };

  const guardarMeta = () => {
    try {
      localStorage.setItem('metaSemanal', tempMeta.toString());
      setMetaSemanal(tempMeta);
      setIsEditingMeta(false);
    } catch (error) {
      console.error('Error al guardar meta:', error);
    }
  };

  const cancelarEdicion = () => {
    setTempMeta(metaSemanal);
    setIsEditingMeta(false);
  };

  const porcentajeCompletado = Math.min((arbolesPlantados / metaSemanal) * 100, 100);
  const arbolesRestantes = Math.max(metaSemanal - arbolesPlantados, 0);

  // Estadísticas adicionales
  const totalProyectos = registros.length;
  const proyectosActivos = registros.filter(r => r.proyectos?.estado === 'Activo').length;
  const proyectosProximos = registros.filter(r => r.proyectos?.estado === 'Próximo').length;

  return (
    <PageContainer>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <div className="bg-linear-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-2xl shadow-lg">
              <TrendingUp className="w-12 h-12" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-400 bg-clip-text text-transparent mb-4">
            {t('estadisticas.titulo')}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {t('estadisticas.descripcion')}
          </p>
        </div>

        {/* Tu Impacto - Card Principal */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">{t('estadisticas.tuImpacto')}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Árboles actuales */}
              <div>
                <div className="text-6xl font-bold mb-2">{arbolesPlantados} {t('estadisticas.arboles')}</div>
                <p className="text-gray-400 mb-4">
                  {arbolesRestantes > 0 
                    ? `${t('estadisticas.faltan')} ${arbolesRestantes} ${t('estadisticas.arboles')} ${t('estadisticas.paraMeta')}`
                    : t('estadisticas.metaCumplida')
                  }
                </p>

                {/* Barra de progreso */}
                <div className="bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeCompletado}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">
                  {porcentajeCompletado.toFixed(0)}% {t('estadisticas.deTuMeta')}
                </p>
              </div>

              {/* Meta semanal editable */}
              <div>
                {isEditingMeta ? (
                  <div className="bg-gray-700/50 rounded-2xl p-6">
                    <label className="block text-sm font-medium mb-3">
                      {t('estadisticas.estableceMeta')}
                    </label>
                    <input
                      type="number"
                      value={tempMeta}
                      onChange={(e) => setTempMeta(parseInt(e.target.value) || 0)}
                      min="1"
                      max="10000"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg focus:ring-2 focus:ring-green-500 mb-4"
                      placeholder={t('estadisticas.placeholderMeta')}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={cancelarEdicion}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        {t('estadisticas.cancelar')}
                      </button>
                      <button
                        onClick={guardarMeta}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                      >
                        {t('estadisticas.guardar')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingMeta(true)}
                    className="bg-gray-700/50 hover:bg-gray-700/70 rounded-2xl p-6 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{t('estadisticas.metaSemanal')}</span>
                      <div className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ✏️ {t('estadisticas.editar')}
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {metaSemanal}
                    </div>
                    <p className="text-sm text-gray-400">
                      {t('estadisticas.arbolesPorSemana')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de estadísticas */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {totalProyectos}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('estadisticas.proyectosRegistrados')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {proyectosActivos}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('estadisticas.proyectosActivos')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {proyectosProximos}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('estadisticas.proyectosProximos')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {porcentajeCompletado >= 100 ? '🏆' : porcentajeCompletado.toFixed(0) + '%'}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('estadisticas.progresoMeta')}
            </p>
          </div>
        </div>

        {/* Lista de proyectos */}
        {registros.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                {t('estadisticas.desgloseContribucion')}
              </h3>
              <div className="space-y-3">
                {registros.map((registro) => {
                  const proyecto = registro.proyectos;
                  const arbolesPorVoluntario = proyecto ? Math.floor(proyecto.arboles / proyecto.voluntarios_esperados) : 0;
                  return (
                    <div 
                      key={registro.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-white">
                          {proyecto?.nombre || 'Proyecto sin nombre'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {proyecto?.fecha || 'Fecha no disponible'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ~{arbolesPorVoluntario}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('estadisticas.arbolesEstimados')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje si no hay proyectos */}
        {registros.length === 0 && (
          <div className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              {t('estadisticas.empiezaAventura')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('estadisticas.registrateProyectos')}
            </p>
            <a 
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              {t('estadisticas.explorarProyectos')}
            </a>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function EstadisticasPageWrapper() {
  return (
    <ProtectedRoute>
      <EstadisticasPage />
    </ProtectedRoute>
  );
}

export { EstadisticasPageWrapper as default };
