"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/contexts/LanguageContext';
import FormularioUnirseEvento from './FormularioUnirseEvento';
import { obtenerColoresEstado } from '@/lib/proyectosUtils';
import { getProyectos, getCurrentUser, verificarRegistro } from '@/lib/supabase-v2';
import { Calendar, Trees, Users, Leaf } from 'lucide-react';

// Función auxiliar para formatear proyectos de Supabase para el mapa
const formatProyectosParaMapa = (proyectos) => {
  return proyectos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    ubicacion: p.ubicacion,
    lat: parseFloat(p.lat) || 0,
    lng: parseFloat(p.lng) || 0,
    arboles: p.arboles || 0,
    voluntarios: p.voluntarios_esperados || 0,
    especies: p.especies || [],
    fecha: p.fecha?.split('T')[0] || p.fecha || '',
    estado: p.estado || 'Próximo',
    descripcion: p.descripcion || '',
    organizers: [] // Se puede obtener de proyecto_organizadores si se necesita
  }));
};

// Iconos personalizados para los marcadores según estado
const createCustomIcon = (estado) => {
  const color = obtenerColoresEstado(estado).marker;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">🌳</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

function MapaProyectos({ searchQuery = '' }) {
  const { t } = useLanguage();
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [eventosReforestacion, setEventosReforestacion] = useState([]);
  const [showFormulario, setShowFormulario] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  
  // Cargar proyectos desde Supabase
  useEffect(() => {
    const loadProyectos = async () => {
      try {
        const { data, error } = await getProyectos();
        if (error) {
          console.error('Error cargando proyectos:', error);
          setEventosReforestacion([]);
          return;
        }
        const formattedProyectos = formatProyectosParaMapa(data || []);
        console.log('📍 Cargando proyectos para el mapa:', formattedProyectos.length, 'proyectos encontrados');
        setEventosReforestacion(formattedProyectos);
      } catch (err) {
        console.error('Error:', err);
        setEventosReforestacion([]);
      }
    };
    
    loadProyectos();
    
    // Escuchar evento personalizado cuando se actualizan proyectos
    const handleProjectsUpdated = () => {
      console.log('🗺️ Actualizando mapa de proyectos...');
      loadProyectos();
    };
    
    window.addEventListener('projectsUpdated', handleProjectsUpdated);
    
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdated);
    };
  }, []);
  
  // Centro de Manabí
  const centroManabi = [-0.9, -80.0];
  
  // Filtrar por estado
  let eventosFiltrados = filtroEstado === 'Todos' 
    ? eventosReforestacion 
    : eventosReforestacion.filter(e => e.estado === filtroEstado);
  
  // Filtrar por búsqueda
  if (searchQuery.trim()) {
    const queryLower = searchQuery.toLowerCase();
    eventosFiltrados = eventosFiltrados.filter(evento => 
      evento.nombre?.toLowerCase().includes(queryLower) ||
      evento.ubicacion?.toLowerCase().includes(queryLower) ||
      evento.descripcion?.toLowerCase().includes(queryLower) ||
      evento.especies?.some(especie => especie.toLowerCase().includes(queryLower))
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
          {t('mapaProyectos.filtrarEstado')}
        </span>
        {['Todos', 'Activo', 'Próximo', 'Completado'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === estado
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {estado === 'Todos' ? t('mapaProyectos.todos') : 
             estado === 'Activo' ? t('mapaProyectos.activo') :
             estado === 'Próximo' ? t('mapaProyectos.proximo') :
             t('mapaProyectos.finalizado')}
          </button>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
          <span className="text-gray-700 dark:text-gray-300">{t('mapaProyectos.finalizado')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
          <span className="text-gray-700 dark:text-gray-300">{t('mapaProyectos.activo')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
          <span className="text-gray-700 dark:text-gray-300">{t('mapaProyectos.proximo')}</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="relative h-[600px] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <MapContainer
          center={centroManabi}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {eventosFiltrados.map((evento) => (
            <Marker
              key={evento.id}
              position={[evento.lat, evento.lng]}
              icon={createCustomIcon(evento.estado)}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div className="p-2">
                  <h3 className="font-bold text-lg text-green-800 mb-2">
                    {evento.nombre}
                  </h3>
                  
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${obtenerColoresEstado(evento.estado).badge}`}>
                      <span className="text-base">{obtenerColoresEstado(evento.estado).icon}</span>
                      <span>{evento.estado}</span>
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 mb-3">
                    {evento.descripcion}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{t('mapaProyectos.fecha')}:</span>
                      <span>{evento.fecha}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-900">
                      <Trees className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">{t('mapaProyectos.arboles')}:</span>
                      <span>{evento.arboles.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-900">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">{t('mapaProyectos.voluntarios')}:</span>
                      <span>{evento.voluntarios}</span>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-gray-900">{t('mapaProyectos.especies')}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-6">
                        {evento.especies.map((especie, idx) => (
                          <span
                            key={idx}
                            className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium"
                          >
                            {especie}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {/* Botón para unirse al proyecto */}
                  <JoinButton 
                    evento={evento} 
                    onOpenForm={() => {
                      setEventoSeleccionado(evento);
                      setShowFormulario(true);
                    }}
                  />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Contador de eventos mostrados */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Mostrando {eventosFiltrados.length} de {eventosReforestacion.length} proyectos
      </div>

      {/* Formulario Modal */}
      <FormularioUnirseEvento
        evento={eventoSeleccionado}
        isOpen={showFormulario}
        onClose={() => {
          setShowFormulario(false);
          setEventoSeleccionado(null);
        }}
      />
    </div>
  );
}

export default MapaProyectos;

function JoinButton({ evento, onOpenForm }) {
  const { t } = useLanguage();

  const handleJoin = async () => {
    try {
      // Verificar si el usuario está autenticado con Supabase
      const user = await getCurrentUser();
      console.log('🔍 Usuario actual:', user);
      
      if (!user) {
        // Redirigir al login si no está autenticado
        alert('Debes iniciar sesión para registrarte en un proyecto');
        globalThis.window.location.href = '/login';
        return;
      }
      
      // Verificar si el usuario es administrador o organizador
      const role = user.profile?.role || user.user_metadata?.role || 'volunteer';
      console.log('👤 Rol del usuario:', role);
      
      if (role === 'admin') {
        alert(t('userMenu.adminCannotRegister') || 'Los administradores no pueden registrarse en proyectos');
        return;
      }
      if (role === 'organizer') {
        alert(t('userMenu.organizerCannotRegister') || 'Los organizadores no pueden registrarse en proyectos');
        return;
      }
      
      // Verificar si ya está registrado en este proyecto
      const userId = user.id || user.profile?.id;
      console.log('🆔 UserId para verificar:', userId);
      console.log('📍 Proyecto ID:', evento.id);
      
      if (userId) {
        const { data: registroExistente, error } = await verificarRegistro(userId, evento.id);
        console.log('✅ Resultado verificación:', { data: registroExistente, error });
        
        if (registroExistente) {
          console.log('⚠️ Ya registrado:', registroExistente);
          alert(t('userMenu.alreadyRegistered') || 'Ya estás registrado en este proyecto');
          return;
        }
      }
      
      console.log('✅ Abriendo formulario de registro');
      // Abrir el formulario
      onOpenForm();
    } catch (e) {
      console.error('❌ Error al verificar registro:', e);
      // Permitir abrir el formulario de todos modos
      onOpenForm();
    }
  };

  return (
    <button
      onClick={handleJoin}
      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-bold transition-colors shadow-lg hover:shadow-xl border border-green-800"
    >
      <Users className="w-4 h-4 stroke-[2.5]" />
      <span className="text-white">{t('modal.registrarse') || 'Register'}</span>
    </button>
  );
}
