"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import Toast from '@/components/ui/Toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2, MapPin, Save, X, Trees, Calendar, Users, Leaf, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { getProyectos, createProyecto, updateProyecto, deleteProyecto, getPerfilesByRole } from '@/lib/supabase-v2';

function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  // Helper function to get translated status text
  const getStatusText = (status) => {
    switch (status) {
      case 'Completado': return t('admin.completedStatus');
      case 'Activo': return t('admin.inProgressStatus');
      case 'Cancelado': return t('admin.canceledStatus') || 'Cancelado';
      case 'Próximo': return t('admin.upcomingStatus');
      default: return status;
    }
  };
  
  // All state hooks in a consistent order
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [availableOrganizers, setAvailableOrganizers] = useState([]);
  const [searchOrganizer, setSearchOrganizer] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    ubicacion: '',
    lat: '',
    lng: '',
    arboles: '',
    voluntarios: '',
    especies: '',
    fecha: '',
    estado: 'Próximo',
    descripcion: '',
    organizers: []
  });

  // Función para mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Ubicaciones predefinidas de Manabí
  const ubicacionesManabi = [
    { nombre: 'Manta', lat: -0.9537, lng: -80.7089 },
    { nombre: 'Portoviejo', lat: -1.0543, lng: -80.4553 },
    { nombre: 'Bahía de Caráquez', lat: -0.6, lng: -80.4167 },
    { nombre: 'Chone', lat: -0.6944, lng: -80.0928 },
    { nombre: 'El Carmen', lat: -0.2772, lng: -79.4569 },
    { nombre: 'Jipijapa', lat: -1.3486, lng: -80.5783 },
    { nombre: 'Montecristi', lat: -1.0453, lng: -80.6594 },
    { nombre: 'Pedernales', lat: -0.0708, lng: -80.0531 },
    { nombre: 'Puerto López', lat: -1.5514, lng: -80.8186 },
    { nombre: 'Rocafuerte', lat: -0.9244, lng: -80.4572 },
    { nombre: 'San Vicente', lat: -0.6294, lng: -80.3889 },
    { nombre: 'Sucre (Bahía)', lat: -0.6597, lng: -80.4258 },
    { nombre: 'Tosagua', lat: -0.7875, lng: -80.2364 },
    { nombre: 'Jaramijó', lat: -0.9331, lng: -80.5731 },
    { nombre: 'Paján', lat: -1.5667, lng: -80.4333 },
  ];

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/supabase-v2');
        const user = await getCurrentUser();
        
        if (user && user.profile) {
          const role = user.profile.role || user.user_metadata?.role || 'volunteer';
          console.log('🔐 Verificando acceso admin. Rol:', role);
          
          if (role === 'admin') {
            setIsAdmin(true);
          } else {
            router.push('/');
          }
        } else {
          router.push('/login');
        }
      } catch (e) {
        console.error('Error verificando admin:', e);
        router.push('/');
      }
    };
    
    checkAdmin();
  }, [router]);

  // Cargar proyectos desde Supabase
  useEffect(() => {
    if (!isAdmin) return;
    
    const cargarProyectosDesdeSupabase = async () => {
      console.log('🔄 Cargando proyectos desde Supabase...');
      
      try {
        const { data, error } = await getProyectos();
        
        if (error) {
          console.error('Error cargando proyectos:', error);
          showToast('Error al cargar proyectos', 'error');
          setProyectos([]);
          return;
        }
        
        console.log('📦 Proyectos cargados desde Supabase:', data?.length || 0);
        setProyectos(data || []);
      } catch (err) {
        console.error('Error en cargarProyectosDesdeSupabase:', err);
        setProyectos([]);
      }
    };
    
    cargarProyectosDesdeSupabase();
    
    // Escuchar el evento projectsUpdated para recargar
    const handleProjectsUpdate = () => {
      console.log('🔔 Evento projectsUpdated recibido en admin');
      cargarProyectosDesdeSupabase();
    };
    
    window.addEventListener('projectsUpdated', handleProjectsUpdate);
    
    // Cargar organizadores desde Supabase
    const cargarOrganizadores = async () => {
      console.log('👥 Cargando organizadores desde Supabase...');
      const { data, error } = await getPerfilesByRole('organizer');
      if (error) {
        console.error('Error cargando organizadores:', error);
        setAvailableOrganizers([]);
      } else {
        console.log('✅ Organizadores cargados:', data?.length || 0);
        setAvailableOrganizers(data || []);
      }
    };
    
    cargarOrganizadores();
    
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate);
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verificando permisos...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrganizersChange = (email, checked) => {
    setFormData(prev => {
      const list = Array.isArray(prev.organizers) ? [...prev.organizers] : [];
      if (checked) {
        if (!list.includes(email)) list.push(email);
      } else {
        const idx = list.indexOf(email);
        if (idx !== -1) list.splice(idx, 1);
      }
      return { ...prev, organizers: list };
    });
  };

  const handleUbicacionChange = (e) => {
    const ubicacionNombre = e.target.value;
    const ubicacion = ubicacionesManabi.find(u => u.nombre === ubicacionNombre);
    
    if (ubicacion) {
      setFormData(prev => ({
        ...prev,
        ubicacion: ubicacion.nombre,
        lat: ubicacion.lat.toString(),
        lng: ubicacion.lng.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        ubicacion: ubicacionNombre
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convertir especies de string a array
      const especiesArray = typeof formData.especies === 'string' 
        ? formData.especies.split(',').map(e => e.trim()).filter(e => e)
        : formData.especies;
      
      const proyectoData = {
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        descripcion: formData.descripcion,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        fecha: formData.fecha,
        arboles: parseInt(formData.arboles),
        voluntarios_esperados: parseInt(formData.voluntarios),
        especies: especiesArray,
        estado: formData.estado || 'Próximo'
      };
      
      if (editingProject) {
        // Actualizar proyecto existente
        const { error } = await updateProyecto(editingProject, proyectoData);
        
        if (error) {
          console.error('Error actualizando proyecto:', error);
          showToast('Error al actualizar proyecto', 'error');
          return;
        }
        
        showToast(t('admin.saveSuccess'), 'success');
      } else {
        // Crear nuevo proyecto
        const { error } = await createProyecto(proyectoData);
        
        if (error) {
          console.error('Error creando proyecto:', error);
          showToast('Error al crear proyecto', 'error');
          return;
        }
        
        showToast(t('admin.saveSuccess'), 'success');
      }
      
      // Recargar proyectos desde Supabase
      const { data: proyectosActualizados } = await getProyectos();
      setProyectos(proyectosActualizados || []);
      
      // Disparar evento para actualizar el mapa
      window.dispatchEvent(new Event('projectsUpdated'));
      
      closeModal();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      showToast(t('admin.saveError', 'Error saving project'), 'error');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    // Convertir especies de array a string si es necesario
    const formattedProject = {
      ...project,
      especies: Array.isArray(project.especies) 
        ? project.especies.join(', ') 
        : project.especies
    };
    setFormData(formattedProject);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setProjectToDelete(id);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      console.log('🗑️ Iniciando eliminación del proyecto:', projectToDelete);
      
      // Eliminar el proyecto de Supabase
      const { error } = await deleteProyecto(projectToDelete);
      
      if (error) {
        console.error('❌ Error al eliminar proyecto:', error);
        showToast('Error al eliminar el proyecto', 'error');
        setProjectToDelete(null);
        return;
      }
      
      console.log('✅ Proyecto eliminado exitosamente de Supabase');
      
      // Recargar proyectos desde Supabase
      const { data } = await getProyectos();
      setProyectos(data || []);
      console.log('📊 Proyectos recargados desde Supabase:', data?.length || 0);
      
      // Disparar evento para actualizar el mapa
      console.log('🗺 Disparando evento projectsUpdated');
      window.dispatchEvent(new Event('projectsUpdated'));
      
      setProjectToDelete(null);
      showToast(t('admin.deleteSuccess'), 'success');
    }
  };

  const openNewProjectModal = () => {
    setEditingProject(null);
    setFormData({
      id: '',
      nombre: '',
      ubicacion: '',
      lat: '',
      lng: '',
      arboles: '',
      voluntarios: '',
      especies: '',
      fecha: '',
      estado: 'Próximo',
      descripcion: '',
      organizers: []
    });
    setIsModalOpen(true);
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      id: '',
      nombre: '',
      ubicacion: '',
      lat: '',
      lng: '',
      arboles: '',
      voluntarios: '',
      especies: '',
      fecha: '',
      estado: 'Próximo',
      descripcion: '',
      organizers: []
    });
  };

  return (
    <PageContainer>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: 'success' })}
          />
        )}

        <AlertDialog open={projectToDelete !== null} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.deleteProject')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin.confirmDelete')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                {t('admin.deleteProject')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-block mb-4">
                <div className="bg-linear-to-r from-purple-600 to-pink-500 text-white p-4 rounded-2xl shadow-lg">
                  <Trees className="w-12 h-12" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-700 via-purple-600 to-pink-600 dark:from-purple-400 dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent mb-4">
                {t('admin.titulo')}
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {t('admin.subtitulo')}
              </p>
            </div>
            <button
              onClick={openNewProjectModal}
              className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              {t('common.newProject')}
            </button>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="grid gap-6">
          {proyectos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <Trees className="w-16 h-16 mx-auto mb-4 text-gray-400" strokeWidth={2} />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {t('admin.noProjects')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.noProjectsDesc')}</p>
            </div>
          ) : (
            proyectos.map(project => {
              // Determinar icono de estado
              const StatusIcon = project.estado === 'Completado' ? CheckCircle : 
                                 project.estado === 'Activo' ? PlayCircle : Clock;
              
              return (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{project.nombre}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          project.estado === 'Completado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          project.estado === 'Activo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          project.estado === 'Cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {getStatusText(project.estado)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{project.ubicacion}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{project.fecha}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trees className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span>{project.arboles} árboles</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>{project.voluntarios} voluntarios</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{project.descripcion}</p>
                      
                      {project.especies && (
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          {(Array.isArray(project.especies) 
                            ? project.especies 
                            : project.especies.split(',')
                          ).map((especie, idx) => (
                            <span key={idx} className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded text-xs">
                              {typeof especie === 'string' ? especie.trim() : especie}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {project.organizers && project.organizers.length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {t('admin.organizadores')}: {project.organizers.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button 
                        onClick={() => handleEdit(project)} 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('common.edit')}
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal para agregar/editar proyecto */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingProject ? t('common.edit') : t('common.newProject')}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nombre del proyecto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.nombreProyecto')} *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('admin.nombreProyectoPlaceholder')}
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.location')} *
                  </label>
                  <select
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleUbicacionChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">{t('admin.selectLocation')}</option>
                    {ubicacionesManabi.map((ub) => (
                      <option key={ub.nombre} value={ub.nombre}>
                        {ub.nombre}
                      </option>
                    ))}
                    <option value="Otra">{t('admin.otraUbicacion')}</option>
                  </select>
                  {formData.ubicacion === 'Otra' && (
                    <input
                      type="text"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleInputChange}
                      required
                      placeholder={t('admin.escribeUbicacion')}
                      className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* Coordenadas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.coordenadas')}
                  </label>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-1 font-medium">
                      💡 {t('admin.coordenadasAyuda')}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {t('admin.coordenadasPersonalizadas')}{' '}
                      <a 
                        href="https://www.google.com/maps" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        {t('admin.googleMaps')}
                      </a>
                      {' '}{t('admin.googleMapsInfo')}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('admin.latitud')} *
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="-1.0546"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('admin.longitud')} *
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="-80.4545"
                      />
                    </div>
                  </div>
                </div>
                {/* Árboles y Voluntarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Trees className="w-4 h-4 text-green-600 dark:text-green-400" />
                      {t('admin.numeroArboles')} *
                    </label>
                    <input
                      type="number"
                      name="arboles"
                      value={formData.arboles}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      {t('admin.voluntariosNecesarios')} *
                    </label>
                    <input
                      type="number"
                      name="voluntarios"
                      value={formData.voluntarios}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Especies */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {t('admin.especies')} *
                  </label>
                  <input
                    type="text"
                    name="especies"
                    value={formData.especies}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('admin.especiesPlaceholder')}
                  />
                </div>

                {/* Fecha y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      {t('admin.fechaEvento')} *
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      {t('admin.projectStatus')} *
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Próximo">{t('admin.upcomingStatus')}</option>
                      <option value="Activo">{t('admin.inProgressStatus')}</option>
                      <option value="Completado">{t('admin.completedStatus')}</option>
                      <option value="Cancelado">{t('admin.canceledStatus') || 'Cancelado'}</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                  {/* Organizadores asignados */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin.organizadores')}</label>
                    
                    {/* Barra de búsqueda */}
                    <input
                      type="text"
                      placeholder="Buscar organizador por nombre..."
                      value={searchOrganizer}
                      onChange={(e) => setSearchOrganizer(e.target.value)}
                      className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {availableOrganizers.length === 0 ? (
                        <p className="text-sm text-gray-500">{t('admin.noOrganizersAvailable')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableOrganizers
                            .filter(org => 
                              org.nombre.toLowerCase().includes(searchOrganizer.toLowerCase()) ||
                              org.email.toLowerCase().includes(searchOrganizer.toLowerCase())
                            )
                            .map(org => (
                              <label key={org.email} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={Array.isArray(formData.organizers) && formData.organizers.includes(org.email)} 
                                  onChange={(e) => handleOrganizersChange(org.email, e.target.checked)}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="ml-1">{org.nombre} <span className="text-xs text-gray-500">({org.email})</span></span>
                              </label>
                            ))
                          }
                          {availableOrganizers.filter(org => 
                            org.nombre.toLowerCase().includes(searchOrganizer.toLowerCase()) ||
                            org.email.toLowerCase().includes(searchOrganizer.toLowerCase())
                          ).length === 0 && searchOrganizer && (
                            <p className="text-sm text-gray-500 italic">No se encontraron organizadores con ese nombre</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.descripcion')} *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('admin.descripcionPlaceholder')}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" strokeWidth={2.5} />
                    {editingProject ? t('admin.guardarCambios') : t('admin.crearProyecto')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-semibold transition-colors"
                  >
                    {t('admin.cancelar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function AdminPageWrapper() {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  );
}

export default AdminPageWrapper;
