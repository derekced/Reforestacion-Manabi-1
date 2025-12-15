"use client";

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Award, X, FileText, MapPin, Trash, CheckCircle } from 'lucide-react';
import ConfirmModal from './ui/ConfirmModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProyectos, getRegistrosProyecto } from '@/lib/supabase-v2';

export default function GestionVoluntarios() {
  const { t } = useLanguage();
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [voluntarios, setVoluntarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [voluntarioDetalle, setVoluntarioDetalle] = useState(null);
  const [contadoresVoluntarios, setContadoresVoluntarios] = useState({});

  useEffect(() => {
    cargarProyectos();
    
    const handleUpdate = () => {
      cargarProyectos();
      if (proyectoSeleccionado) {
        cargarVoluntariosPorProyecto(proyectoSeleccionado);
      }
    };
    
    globalThis.window.addEventListener('storage', handleUpdate);
    globalThis.window.addEventListener('registrationChange', handleUpdate);
    globalThis.window.addEventListener('projectsChange', handleUpdate);
    
    return () => {
      globalThis.window.removeEventListener('storage', handleUpdate);
      globalThis.window.removeEventListener('registrationChange', handleUpdate);
      globalThis.window.removeEventListener('projectsChange', handleUpdate);
    };
  }, []);

  const cargarProyectos = async () => {
    try {
      const { data, error } = await getProyectos();
      
      if (error) {
        console.error('❌ [GestionVoluntarios] Error al cargar proyectos:', error);
        return;
      }
      
      console.log('✅ [GestionVoluntarios] Proyectos cargados:', data?.length || 0);
      setProyectos(data || []);
      
      // Cargar contadores de voluntarios para cada proyecto
      const contadores = {};
      for (const proyecto of data || []) {
        const { data: registros, error: errorRegistros } = await getRegistrosProyecto(proyecto.id);
        if (!errorRegistros) {
          contadores[proyecto.id] = registros?.length || 0;
          console.log(`📊 [GestionVoluntarios] Proyecto "${proyecto.nombre}": ${registros?.length || 0} voluntarios`);
        }
      }
      setContadoresVoluntarios(contadores);
      console.log('✅ [GestionVoluntarios] Contadores cargados:', contadores);
    } catch (error) {
      console.error('❌ [GestionVoluntarios] Error al cargar proyectos:', error);
    }
  };

  const cargarVoluntariosPorProyecto = async (proyecto) => {
    try {
      console.log('🔍 [GestionVoluntarios] Cargando voluntarios del proyecto:', proyecto.id, proyecto.nombre);
      
      const { data, error } = await getRegistrosProyecto(proyecto.id);
      
      if (error) {
        console.error('❌ [GestionVoluntarios] Error al cargar voluntarios:', error);
        setVoluntarios([]);
        return;
      }
      
      console.log('📊 [GestionVoluntarios] Registros recibidos de Supabase:', data?.length || 0);
      console.log('📋 [GestionVoluntarios] Detalle registros:', data);
      
      // Formatear los registros para el componente
      const voluntariosFormateados = (data || []).map(r => ({
        id: r.id,
        estado: r.estado,
        userEmail: r.user_email,
        userName: r.user_name,
        telefono: r.telefono,
        edad: r.edad,
        experiencia: r.experiencia,
        disponibilidad: r.disponibilidad,
        transporte: r.transporte,
        comentarios: r.comentarios,
        fechaRegistro: r.fecha_registro,
        evento: { id: proyecto.id }
      }));
      
      console.log('✅ [GestionVoluntarios] Voluntarios formateados:', voluntariosFormateados.length);
      console.log('👥 [GestionVoluntarios] Lista final:', voluntariosFormateados);
      
      setVoluntarios(voluntariosFormateados);
      setProyectoSeleccionado(proyecto);
    } catch (error) {
      console.error('❌ [GestionVoluntarios] Error al cargar voluntarios:', error);
    }
  };

  const [confirmState, setConfirmState] = useState({ open: false, id: null });

  const persistRegistrations = (newRegs) => {
    try {
      localStorage.setItem('eventRegistrations', JSON.stringify(newRegs));
      // notify other windows/components
      globalThis.window.dispatchEvent(new Event('registrationChange'));
      // update local state
      if (proyectoSeleccionado) {
        const regsForProject = newRegs.filter(r => r.evento?.id === proyectoSeleccionado.id);
        setVoluntarios(regsForProject);
      } else {
        setVoluntarios(newRegs);
      }
    } catch (e) {
      console.error('Error al persistir registros:', e);
    }
  };

  const toggleAttendance = (registrationId) => {
    try {
      const data = localStorage.getItem('eventRegistrations');
      const regs = data ? JSON.parse(data) : [];
      const idx = regs.findIndex(r => r.id === registrationId);
      if (idx === -1) return;
      regs[idx].attended = !regs[idx].attended;
      persistRegistrations(regs);
    } catch (e) {
      console.error('Error al cambiar asistencia:', e);
    }
  };

  const removeVoluntario = (registrationId) => {
    setConfirmState({ open: true, id: registrationId });
  };

  const handleConfirmRemove = () => {
    try {
      const registrationId = confirmState.id;
      const data = localStorage.getItem('eventRegistrations');
      const regs = data ? JSON.parse(data) : [];
      const newRegs = regs.filter(r => r.id !== registrationId);
      persistRegistrations(newRegs);
      if (voluntarioDetalle?.id === registrationId) setVoluntarioDetalle(null);
    } catch (e) {
      console.error('Error al eliminar voluntario:', e);
    } finally {
      setConfirmState({ open: false, id: null });
    }
  };

  const voluntariosFiltrados = voluntarios.filter(v => {
    const searchLower = busqueda.toLowerCase();
    return (
      v.userName?.toLowerCase().includes(searchLower) ||
      v.userEmail?.toLowerCase().includes(searchLower) ||
      v.phone?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
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
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('gestionVoluntarios.titulo')}</h2>
            <p className="text-purple-100">{t('gestionVoluntarios.subtitulo')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Proyectos */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {t('gestionVoluntarios.proyectos')}
          </h3>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {proyectos.length > 0 ? (
              proyectos.map((proyecto) => {
                const cantidadVoluntarios = contadoresVoluntarios[proyecto.id] || 0;
                
                return (
                  <button
                    key={proyecto.id}
                    onClick={() => cargarVoluntariosPorProyecto(proyecto)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      proyectoSeleccionado?.id === proyecto.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                          {proyecto.nombre}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {proyecto.ubicacion}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                        <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                          {cantidadVoluntarios}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        proyecto.estado === 'Activo' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : proyecto.estado === 'Próximo'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {proyecto.estado}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('gestionVoluntarios.noProyectos')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Voluntarios */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {proyectoSeleccionado ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {t('gestionVoluntarios.voluntariosEn')} {proyectoSeleccionado.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {voluntarios.length} {t('gestionVoluntarios.registrados')}
                  </p>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('gestionVoluntarios.buscar')}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Lista de voluntarios */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {voluntariosFiltrados.length > 0 ? (
                  voluntariosFiltrados.map((voluntario) => (
                    <div
                      key={voluntario.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              {voluntario.userName}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{voluntario.userEmail}</span>
                            </div>
                            {voluntario.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{voluntario.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(voluntario.fechaRegistro)}</span>
                            </div>
                            {voluntario.age && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{t('gestionVoluntarios.edad')}:</span>
                                <span>{voluntario.age} {t('gestionVoluntarios.anios')}</span>
                              </div>
                            )}
                          </div>

                          {voluntario.experience && (
                            <div className="mt-2 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {t('gestionVoluntarios.experiencia')}:
                              </span>
                              <span className="ml-1 text-gray-600 dark:text-gray-400">
                                {voluntario.experience}
                              </span>
                            </div>
                          )}

                          {voluntario.availability && (
                            <div className="mt-1 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {t('gestionVoluntarios.disponibilidad')}:
                              </span>
                              <span className="ml-1 text-gray-600 dark:text-gray-400">
                                {voluntario.availability}
                              </span>
                            </div>
                          )}

                          {voluntario.transport && (
                            <div className="mt-1 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {t('gestionVoluntarios.transporte')}:
                              </span>
                              <span className="ml-1 text-gray-600 dark:text-gray-400">
                                {voluntario.transport}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          {/* Attendance badge / toggle */}
                          {voluntario.attended ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                              <CheckCircle className="w-4 h-4" />
                              {t('gestionVoluntarios.asistio') || 'Asistió'}
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleAttendance(voluntario.id)}
                              className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 px-2 py-1 rounded-full text-xs hover:brightness-95 transition"
                              title={t('gestionVoluntarios.marcarAsistencia') || 'Marcar asistencia'}
                            >
                              <CheckCircle className="w-4 h-4" />
                              {t('gestionVoluntarios.marcar') || 'Marcar'}
                            </button>
                          )}

                          <button
                            onClick={() => removeVoluntario(voluntario.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('gestionVoluntarios.remover')}
                          >
                            <Trash className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setVoluntarioDetalle(voluntario)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title={t('gestionVoluntarios.verDetalle')}
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {busqueda 
                        ? t('gestionVoluntarios.noResultados')
                        : t('gestionVoluntarios.noVoluntarios')}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MapPin className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-semibold mb-2">{t('gestionVoluntarios.seleccionaProyecto')}</p>
                <p className="text-sm">{t('gestionVoluntarios.seleccionaProyectoDesc')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {voluntarioDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-linear-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{voluntarioDetalle.userName}</h3>
                  <p className="text-purple-100 text-sm">{t('gestionVoluntarios.detalleCompleto')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {/* Toggle attendance in modal */}
                {voluntarioDetalle.attended ? (
                  <button
                    onClick={() => toggleAttendance(voluntarioDetalle.id)}
                    className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('gestionVoluntarios.quitarAsistencia') || 'Quitar asistencia'}
                  </button>
                ) : (
                  <button
                    onClick={() => toggleAttendance(voluntarioDetalle.id)}
                    className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('gestionVoluntarios.marcarAsistencia') || 'Marcar asistencia'}
                  </button>
                )}

                <button
                  onClick={() => removeVoluntario(voluntarioDetalle.id)}
                  className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  {t('gestionVoluntarios.remover')}
                </button>

                <button
                  onClick={() => setVoluntarioDetalle(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Información de contacto */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {t('gestionVoluntarios.informacionContacto')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{t('gestionVoluntarios.email')}:</span>
                    <span className="text-gray-800 dark:text-white font-medium">{voluntarioDetalle.userEmail}</span>
                  </div>
                  {voluntarioDetalle.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{t('gestionVoluntarios.telefono')}:</span>
                      <span className="text-gray-800 dark:text-white font-medium">{voluntarioDetalle.phone}</span>
                    </div>
                  )}
                  {voluntarioDetalle.age && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">{t('gestionVoluntarios.edad')}:</span>
                      <span className="text-gray-800 dark:text-white font-medium">{voluntarioDetalle.age} {t('gestionVoluntarios.anios')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del proyecto */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {t('gestionVoluntarios.proyecto')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('gestionVoluntarios.nombreProyecto')}:</span>
                    <span className="ml-2 text-gray-800 dark:text-white font-medium">
                      {voluntarioDetalle.evento?.nombre || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('gestionVoluntarios.fechaRegistro')}:</span>
                    <span className="ml-2 text-gray-800 dark:text-white font-medium">
                      {formatDate(voluntarioDetalle.fechaRegistro)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Perfil de voluntario */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {t('gestionVoluntarios.perfilVoluntario')}
                </h4>
                <div className="space-y-3 text-sm">
                  {voluntarioDetalle.experience && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">{t('gestionVoluntarios.experiencia')}:</span>
                      <span className="text-gray-800 dark:text-white">{voluntarioDetalle.experience}</span>
                    </div>
                  )}
                  {voluntarioDetalle.availability && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">{t('gestionVoluntarios.disponibilidad')}:</span>
                      <span className="text-gray-800 dark:text-white">{voluntarioDetalle.availability}</span>
                    </div>
                  )}
                  {voluntarioDetalle.transport && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">{t('gestionVoluntarios.transporte')}:</span>
                      <span className="text-gray-800 dark:text-white">{voluntarioDetalle.transport}</span>
                    </div>
                  )}
                  {voluntarioDetalle.comments && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">{t('gestionVoluntarios.comentarios')}:</span>
                      <p className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                        {voluntarioDetalle.comments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    {/* Modal de confirmación para eliminar voluntario */}
    <ConfirmModal
      open={confirmState.open}
      title={t('gestionVoluntarios.titulo') || 'Gestión de Voluntarios'}
      message={t('gestionVoluntarios.confirmRemove') || '¿Eliminar voluntario?'}
      onConfirm={handleConfirmRemove}
      onCancel={() => setConfirmState({ open: false, id: null })}
    />
    </div>
  );
}
