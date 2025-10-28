"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Edit, Trash2, MapPin, Save, X, Trees } from 'lucide-react';

function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [proyectos, setProyectos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    descripcion: ''
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
          estado: 'Próximo',
          descripcion: 'Recuperación de bosque seco tropical en el Parque Nacional Machalilla'
        },
        {
          id: '2',
          nombre: 'Bosque Urbano Manta',
          ubicacion: 'Manta',
          lat: -0.9537,
          lng: -0.7089,
          arboles: 1200,
          voluntarios: 80,
          especies: 'Neem, Almendro, Laurel',
          fecha: '2025-01-20',
          estado: 'Activo',
          descripcion: 'Creación de bosque urbano en la zona costera de Manta'
        }
      ];
      localStorage.setItem('proyectos', JSON.stringify(defaultProjects));
      setProyectos(defaultProjects);
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
    
    if (editingProject) {
      // Actualizar proyecto existente
      const updatedProjects = proyectos.map(p => 
        p.id === editingProject.id ? { ...formData, id: editingProject.id } : p
      );
      setProyectos(updatedProjects);
      localStorage.setItem('proyectos', JSON.stringify(updatedProjects));
    } else {
      // Crear nuevo proyecto
      const newProject = {
        ...formData,
        id: Date.now().toString()
      };
      const updatedProjects = [...proyectos, newProject];
      setProyectos(updatedProjects);
      localStorage.setItem('proyectos', JSON.stringify(updatedProjects));
    }
    
    closeModal();
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData(project);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm(t('admin.confirmarEliminar'))) {
      const updatedProjects = proyectos.filter(p => p.id !== id);
      setProyectos(updatedProjects);
      localStorage.setItem('proyectos', JSON.stringify(updatedProjects));
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
      descripcion: ''
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
      descripcion: ''
    });
  };

  return (
    <PageContainer>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
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
              {t('admin.nuevoProyecto')}
            </button>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="grid gap-6">
          {proyectos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <Trees className="w-16 h-16 mx-auto mb-4 text-gray-400" strokeWidth={2} />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {t('admin.noHayProyectos')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('admin.noHayProyectosDesc')}
              </p>
              <button
                onClick={openNewProjectModal}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('admin.agregarProyecto')}
              </button>
            </div>
          ) : (
            proyectos.map((proyecto) => (
              <div
                key={proyecto.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                          {proyecto.nombre}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          proyecto.estado === 'Activo' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : proyecto.estado === 'Próximo'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {proyecto.estado}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" strokeWidth={2.5} />
                        <span>{proyecto.ubicacion}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {proyecto.descripcion}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('admin.arbolesLabel')}</p>
                          <p className="text-lg font-bold text-green-700 dark:text-green-400">
                            {proyecto.arboles}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('admin.voluntariosLabel')}</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                            {proyecto.voluntarios}
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('admin.especiesLabelCard')}</p>
                          <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                            {proyecto.especies.split(',').length}
                          </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('admin.fechaLabel')}</p>
                          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                            {new Date(proyecto.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {t('admin.coordenadas')}: {proyecto.lat}, {proyecto.lng}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(proyecto)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(proyecto.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
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
                  {editingProject ? t('admin.editarProyecto') : t('admin.nuevoProyecto')}
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
                    {t('admin.ubicacion')} *
                  </label>
                  <select
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleUbicacionChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">{t('admin.seleccionaUbicacion')}</option>
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
                      {t('admin.estado')} *
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Próximo">{t('admin.proximo')}</option>
                      <option value="Activo">{t('admin.activo')}</option>
                      <option value="Completado">{t('admin.completado')}</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
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
