"use client";

import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, TreePine, CheckCircle, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrentUser, getRegistrosUsuario, cancelarRegistro, registrarAsistencia, getAsistenciasUsuario } from '@/lib/supabase-v2';

export default function MisProyectos() {
  const { t } = useLanguage();
  const [registros, setRegistros] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);
  const [arbolesPlantados, setArbolesPlantados] = useState('');
  const [asistencias, setAsistencias] = useState([]);

  useEffect(() => {
    cargarRegistros();
    cargarAsistencias();
    
    // Escuchar cambios en los registros
    const handleRegistrationChange = () => {
      cargarRegistros();
    };
    
    const handleAsistenciaChange = () => {
      cargarAsistencias();
    };
    
    window.addEventListener('registrationChange', handleRegistrationChange);
    window.addEventListener('asistenciaChange', handleAsistenciaChange);
    return () => {
      window.removeEventListener('registrationChange', handleRegistrationChange);
      window.removeEventListener('asistenciaChange', handleAsistenciaChange);
    };
  }, []);

  const cargarRegistros = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setRegistros([]);
        return;
      }

      const userId = user.id || user.profile?.id;
      if (!userId) {
        console.log('No se pudo obtener userId');
        setRegistros([]);
        return;
      }

      const { data, error } = await getRegistrosUsuario(userId);
      if (error) {
        console.error('Error al cargar registros:', error);
        setRegistros([]);
        return;
      }
      
      // Formatear registros para el componente
      const formattedRegistros = (data || []).map(r => ({
        id: r.id,
        estado: 'confirmado',
        userEmail: user.email,
        userName: r.nombre_completo,
        evento: {
          id: r.proyectos?.id || '',
          nombre: r.proyectos?.nombre || '',
          fecha: r.proyectos?.fecha_inicio?.split('T')[0] || '',
          ubicacion: r.proyectos?.ubicacion || '',
          lat: parseFloat(r.proyectos?.latitud) || 0,
          lng: parseFloat(r.proyectos?.longitud) || 0,
          estado: r.proyectos?.estado || 'Activo',
          especies: r.proyectos?.especies || [],
          arboles: r.proyectos?.meta_arboles || 0,
          voluntarios: r.proyectos?.voluntarios_requeridos || 0,
          descripcion: r.proyectos?.descripcion || ''
        },
        fechaRegistro: r.fecha_registro
      }));
      
      setRegistros(formattedRegistros);
    } catch (error) {
      console.error('Error al cargar registros:', error);
      setRegistros([]);
    }
  };

  const cargarAsistencias = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setAsistencias([]);
        return;
      }

      const userId = user.id || user.profile?.id;
      if (!userId) {
        setAsistencias([]);
        return;
      }

      const { data, error } = await getAsistenciasUsuario(userId);
      if (error) {
        console.error('Error al cargar asistencias:', error);
        setAsistencias([]);
        return;
      }
      
      // Formatear asistencias
      const formattedAsistencias = (data || []).map(a => ({
        projectId: a.proyecto_id,
        userEmail: a.email_usuario,
        userName: a.nombre_usuario,
        arbolesPlantados: a.arboles_plantados,
        fechaRegistro: a.fecha_asistencia
      }));
      
      setAsistencias(formattedAsistencias);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      setAsistencias([]);
    }
  };

  const getAsistencia = (projectId) => {
    return asistencias.find(a => a.projectId === projectId);
  };

  const handleCancelar = (registro) => {
    setSelectedRegistro(registro);
    setShowCancelModal(true);
  };

  const confirmarCancelacion = async () => {
    try {
      console.log('🗑️ Cancelando registro:', selectedRegistro.id);
      
      const { error } = await cancelarRegistro(selectedRegistro.id);
      
      if (error) {
        console.error('Error al cancelar registro:', error);
        alert('Error al cancelar el registro. Inténtalo de nuevo.');
        return;
      }
      
      console.log('✅ Registro cancelado en Supabase');
      
      // Recargar registros
      await cargarRegistros();
      await cargarAsistencias();
      
      window.dispatchEvent(new Event('registrationChange'));
      window.dispatchEvent(new Event('asistenciaChange'));
      console.log('📢 Eventos disparados: registrationChange y asistenciaChange');
      
      setShowCancelModal(false);
      setSelectedRegistro(null);
    } catch (error) {
      console.error('Error al cancelar:', error);
      alert('Error al cancelar el registro. Inténtalo de nuevo.');
    }
  };

  const handleRegistrarAsistencia = (registro) => {
    setSelectedRegistro(registro);
    setArbolesPlantados('');
    setShowAsistenciaModal(true);
  };

  const confirmarAsistencia = async () => {
    if (!arbolesPlantados || Number(arbolesPlantados) <= 0) {
      alert(t('misProyectos.cantidadInvalida'));
      return;
    }

    // Validar que no exceda el límite de árboles del proyecto
    const maxArboles = selectedRegistro.evento.arboles || 1000;
    if (Number(arbolesPlantados) > maxArboles) {
      alert(t('misProyectos.excedeLimite').replace('{max}', maxArboles));
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        alert('Debes iniciar sesión para registrar asistencia');
        return;
      }

      const userId = user.id || user.profile?.id;
      const userName = user.profile?.nombre || user.user_metadata?.nombre || user.email;

      console.log('📝 [MisProyectos] Registrando asistencia:', {
        proyecto_id: selectedRegistro.evento.id,
        usuario_id: userId,
        user_email: user.email,
        user_name: userName,
        arboles_plantados: Number.parseInt(arbolesPlantados, 10)
      });

      const { error } = await registrarAsistencia({
        proyecto_id: selectedRegistro.evento.id,
        usuario_id: userId,
        user_email: user.email,
        user_name: userName,
        arboles_plantados: Number.parseInt(arbolesPlantados, 10),
        registration_id: selectedRegistro.id
      });

      if (error) {
        console.error('❌ [MisProyectos] Error al registrar asistencia:', error);
        alert(t('misProyectos.errorRegistrar'));
        return;
      }

      console.log('✅ [MisProyectos] Asistencia registrada exitosamente');

      // Recargar asistencias
      await cargarAsistencias();
      
      window.dispatchEvent(new Event('asistenciaChange'));
      window.dispatchEvent(new Event('storage'));
      
      setShowAsistenciaModal(false);
      setSelectedRegistro(null);
      setArbolesPlantados('');
      
      alert(t('misProyectos.asistenciaExito'));
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      alert(t('misProyectos.errorRegistrar'));
    }
  };

  if (registros.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
            <TreePine className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {t('misProyectos.noProyectos')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('misProyectos.noProyectosDesc')}
        </p>
        <a 
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {t('misProyectos.explorarProyectos')}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('misProyectos.titulo')} ({registros.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {registros.map((registro) => (
          <div
            key={registro.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                      <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {registro.evento.nombre}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {registro.evento.descripcion || 'Proyecto de reforestación'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  registro.evento.estado === 'Activo' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {registro.evento.estado}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{t('misProyectos.fecha')}</p>
                    <p className="font-medium text-gray-800 dark:text-white">{registro.evento.fecha}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <TreePine className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{t('misProyectos.arboles')}</p>
                    <p className="font-medium text-gray-800 dark:text-white">{registro.evento.arboles || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{t('misProyectos.voluntarios')}</p>
                    <p className="font-medium text-gray-800 dark:text-white">{registro.evento.voluntarios || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{t('misProyectos.ubicacion')}</p>
                    <p className="font-medium text-gray-800 dark:text-white">Manabí</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{t('misProyectos.especies')}: </span>
                  {registro.evento.especies && Array.isArray(registro.evento.especies) 
                    ? registro.evento.especies.join(', ') 
                    : 'No especificado'}
                </p>
              </div>

              {/* Indicador de asistencia registrada */}
              {(() => {
                const asistencia = getAsistencia(registro.evento.id);
                if (asistencia) {
                  return (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                          {t('misProyectos.asistenciaRegistrada')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <Award className="w-4 h-4" />
                        <span>{t('misProyectos.hasPlantado')} <span className="font-bold">{asistencia.arbolesPlantados}</span> {t('misProyectos.arboles')}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('misProyectos.registradoEl')} {new Date(registro.fechaRegistro).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                {registro.evento.estado !== 'Completado' ? (
                  <div className="flex gap-2">
                    {/* Botón de registrar asistencia */}
                    {!getAsistencia(registro.evento.id) && (
                      <button
                        onClick={() => handleRegistrarAsistencia(registro)}
                        className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                        {t('misProyectos.registrarAsistencia')}
                      </button>
                    )}
                    {getAsistencia(registro.evento.id) && (
                      <button
                        onClick={() => handleRegistrarAsistencia(registro)}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" strokeWidth={2.5} />
                        {t('misProyectos.actualizar')}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelar(registro)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg font-medium transition-colors text-sm"
                    >
                      {t('misProyectos.cancelarRegistro')}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {t('misProyectos.proyectoFinalizado')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación de Cancelación */}
      {showCancelModal && selectedRegistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {t('misProyectos.cancelarTitulo')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('misProyectos.cancelarMensaje')}{' '}
                <span className="font-semibold">{selectedRegistro.evento.nombre}</span>?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedRegistro(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('misProyectos.noMantener')}
              </button>
              <button
                onClick={confirmarCancelacion}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                {t('misProyectos.siCancelar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registrar Asistencia */}
      {showAsistenciaModal && selectedRegistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {t('misProyectos.registrarAsistenciaTitulo')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-semibold">{selectedRegistro.evento.nombre}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {t('misProyectos.ingresaCantidad')}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('misProyectos.arbolesPlantados')} *
              </label>
              <div className="relative">
                <TreePine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                <input
                  type="number"
                  min="1"
                  max={selectedRegistro.evento.arboles || 1000}
                  value={arbolesPlantados}
                  onChange={(e) => setArbolesPlantados(e.target.value)}
                  placeholder={t('misProyectos.placeholderArboles')}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                  autoFocus
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {t('misProyectos.limiteProyecto')}: <span className="font-semibold text-green-600 dark:text-green-400">{selectedRegistro.evento.arboles || 1000}</span> {t('misProyectos.arboles')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {t('misProyectos.soloTuyos')}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">{t('misProyectos.tuContribucion')}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {t('misProyectos.ayudaraRastrear')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAsistenciaModal(false);
                  setSelectedRegistro(null);
                  setArbolesPlantados('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('misProyectos.cancelar')}
              </button>
              <button
                onClick={confirmarAsistencia}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                {t('misProyectos.confirmar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
