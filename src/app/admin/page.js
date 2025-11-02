"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import Toast from '@/components/ui/Toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, MapPin, Save, X, Trees } from 'lucide-react';

function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  // Helper function to get translated status text
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return t('admin.completedStatus');
      case 'in_progress': return t('admin.inProgressStatus');
      default: return t('admin.upcomingStatus');
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
    estado: t('admin.upcoming'),
    descripcion: '',
    organizers: []
  });

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
    try {
      const authUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
      if (authUser) {
        const user = JSON.parse(authUser);
        if (user.role === 'admin') {
          setIsAdmin(true);
        } else {
          // Si no es admin, redirigir a inicio
          router.push('/');
        }
      }
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  // Cargar proyectos desde localStorage
  useEffect(() => {
    if (!isAdmin) return;
    
    const savedProjects = localStorage.getItem('proyectos');
    if (savedProjects) {
      setProyectos(JSON.parse(savedProjects));
    } else {
      // Proyectos de ejemplo si no hay datos
      const defaultProjects = [
        {
          id: '1',
          nombre: 'Reforestación Parque Nacional Machalilla',
          ubicacion: 'Puerto López',
          lat: -1.5514,
          lng: -80.8186,
          arboles: 2500,
          voluntarios: 150,
          especies: 'Guayacán, Ceibo, Fernán Sánchez',
          fecha: '2025-02-15',
          estado: 'upcoming',
          descripcion: 'Recuperación de bosque seco tropical en el Parque Nacional Machalilla',
          organizers: ['organizer1@example.com']
        },
        {
          id: '2',
          nombre: 'Bosque Urbano Manta',
          ubicacion: 'Manta',
          lat: -0.9537,
          lng: -80.7089,
          arboles: 1200,
          voluntarios: 80,
          especies: 'Neem, Almendro, Laurel',
          fecha: '2025-01-20',
          estado: 'in_progress',
          descripcion: 'Creación de bosque urbano en la zona costera de Manta',
          organizers: []
        }
      ];
      localStorage.setItem('proyectos', JSON.stringify(defaultProjects));
      setProyectos(defaultProjects);
    }
    // Cargar lista de organizadores disponibles (usuarios con role === 'organizer')
    try {
      const usuariosRaw = localStorage.getItem('usuarios') || '[]';
      const usuarios = JSON.parse(usuariosRaw);
      const orgs = usuarios.filter(u => u.role === 'organizer').map(u => ({ email: u.email, nombre: u.nombre }));
      setAvailableOrganizers(orgs);
    } catch (e) {
      setAvailableOrganizers([]);
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (editingProject) {
        // Actualizar proyecto existente
        const updatedProjects = proyectos.map(p => 
          p.id === editingProject.id ? { ...formData, id: editingProject.id } : p
        );
        setProyectos(updatedProjects);
        localStorage.setItem('proyectos', JSON.stringify(updatedProjects));
        showToast(t('admin.saveSuccess'), 'success');
      } else {
        // Crear nuevo proyecto
        const newProject = {
          ...formData,
          id: Date.now().toString()
        };
        const updatedProjects = [...proyectos, newProject];
        setProyectos(updatedProjects);
        localStorage.setItem('proyectos', JSON.stringify(updatedProjects));
        showToast(t('admin.saveSuccess'), 'success');
      }
      
      closeModal();
    } catch (error) {
      showToast(t('admin.saveError', 'Error saving project'), 'error');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData(project);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setProjectToDelete(id);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      const updatedProjects = proyectos.filter(p => p.id !== projectToDelete);
      setProyectos(updatedProjects);
      localStorage.setItem('proyectos', JSON.stringify(updatedProjects));
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
      estado: 'upcoming',
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
      estado: 'upcoming',
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
            proyectos.map(project => (
              <div key={project.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{project.nombre}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{project.ubicacion} • {project.fecha}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.estado === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      project.estado === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {getStatusText(project.estado)}
                    </span>
                  </div>
                  <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm">{project.descripcion}</p>
                  {project.organizers && project.organizers.length > 0 && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{t('userMenu.organizadores')}: {project.organizers.join(', ')}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(project)} className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(project.id)} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">{t('common.delete')}</button>
                </div>
              </div>
            ))
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.projectStatus')} *
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="upcoming">{t('admin.upcomingStatus')}</option>
                      <option value="in_progress">{t('admin.inProgressStatus')}</option>
                      <option value="completed">{t('admin.completedStatus')}</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                  {/* Organizadores asignados */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('userMenu.organizadores')}</label>
                    <div className="flex flex-col gap-2">
                      {availableOrganizers.length === 0 ? (
                        <p className="text-sm text-gray-500">{t('admin.noOrganizadoresDisponibles', 'No hay organizadores disponibles. Agrega usuarios con rol "organizer".')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableOrganizers.map(org => (
                            <label key={org.email} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
                              <input type="checkbox" checked={Array.isArray(formData.organizers) && formData.organizers.includes(org.email)} onChange={(e) => handleOrganizersChange(org.email, e.target.checked)} />
                              <span className="ml-1">{org.nombre} <span className="text-xs text-gray-500">({org.email})</span></span>
                            </label>
                          ))}
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
