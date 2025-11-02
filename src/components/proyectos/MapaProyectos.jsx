"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/contexts/LanguageContext';
import FormularioUnirseEvento from './FormularioUnirseEvento';

// Función para cargar proyectos desde localStorage
const getProyectos = () => {
  if (typeof window === 'undefined') return [];
  
  const savedProjects = localStorage.getItem('proyectos');
    if (savedProjects) {
    const projects = JSON.parse(savedProjects);
    // Convertir al formato esperado por el mapa
    return projects.map(p => ({
      id: p.id,
      nombre: p.nombre,
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lng),
      fecha: p.fecha,
      arboles: parseInt(p.arboles),
      voluntarios: parseInt(p.voluntarios),
      especies: (p.especies || '').split(',').map(e => e.trim()),
      descripcion: p.descripcion,
      estado: p.estado,
      ubicacion: p.ubicacion,
      // Soporte para organizadores (array de emails)
      organizers: Array.isArray(p.organizers) ? p.organizers : (p.organizers ? String(p.organizers).split(',').map(s=>s.trim()) : [])
    }));
  }
  
  // Datos de ejemplo si no hay proyectos guardados
    return [
    {
      id: '1',
      nombre: "Reforestación Parque Nacional Machalilla",
      ubicacion: "Puerto López",
      lat: -1.5514,
      lng: -80.8186,
      arboles: 2500,
      voluntarios: 150,
      especies: ['Guayacán', 'Ceibo', 'Fernán Sánchez'],
      fecha: '2025-02-15',
      estado: 'Próximo',
      descripcion: 'Recuperación de bosque seco tropical en el Parque Nacional Machalilla',
      organizers: ['organizer1@example.com']
    },
    {
      id: '2',
      nombre: "Bosque Urbano Manta",
      ubicacion: "Manta",
      lat: -0.9537,
      lng: -80.7089,
      arboles: 1200,
      voluntarios: 80,
      especies: ['Neem', 'Almendro', 'Laurel'],
      fecha: '2025-01-20',
      estado: 'Activo',
      descripcion: 'Creación de bosque urbano en la zona costera de Manta',
      organizers: []
    }
  ];
};

// Iconos personalizados para los marcadores según estado
const createCustomIcon = (estado) => {
  const colorMap = {
    'Completado': '#10b981', // verde
    'Activo': '#3b82f6',      // azul
    'Próximo': '#f59e0b'      // naranja
  };
  
  const color = colorMap[estado] || '#6b7280';
  
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

function MapaProyectos() {
  const { t } = useLanguage();
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [eventosReforestacion, setEventosReforestacion] = useState([]);
  const [showFormulario, setShowFormulario] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  
  // Cargar proyectos desde localStorage
  useEffect(() => {
    setEventosReforestacion(getProyectos());
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      setEventosReforestacion(getProyectos());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Recargar cuando la página está enfocada (para detectar cambios del admin)
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);
  
  // Centro de Manabí
  const centroManabi = [-0.9, -80.0];
  
  const eventosFiltrados = filtroEstado === 'Todos' 
    ? eventosReforestacion 
    : eventosReforestacion.filter(e => e.estado === filtroEstado);

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
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      evento.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      evento.estado === 'Activo' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {evento.estado}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {evento.descripcion}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">📅 {t('mapaProyectos.fecha')}</span>
                      <span>{evento.fecha}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">🌳 {t('mapaProyectos.arboles')}</span>
                      <span>{evento.arboles.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">👥 {t('mapaProyectos.voluntarios')}</span>
                      <span>{evento.voluntarios}</span>
                    </div>
                    
                    <div className="mt-2">
                      <span className="font-semibold">🌿 {t('mapaProyectos.especies')}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {evento.especies.map((especie, idx) => (
                          <span
                            key={idx}
                            className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs"
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

  const handleJoin = () => {
    // Verificar si el usuario está autenticado
    const authRaw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
    if (!authRaw) {
      // Redirigir al login si no está autenticado
      globalThis.window.location.href = '/login';
      return;
    }
    
    // Verificar si el usuario es administrador
    try {
      const user = JSON.parse(authRaw);
      // Los administradores no pueden registrarse en proyectos
      if (user.role === 'admin') {
        alert(t('userMenu.adminCannotRegister'));
        return;
      }
      // Los organizadores pueden crear proyectos, pero no registrarse como voluntarios
      if (user.role === 'organizer') {
        alert(t('userMenu.organizerCannotRegister'));
        return;
      }
      // Verificar si ya está registrado
      const regsRaw = localStorage.getItem('eventRegistrations') || '[]';
      const regs = JSON.parse(regsRaw);
      const exists = regs.find(r => r.evento && r.evento.id === evento.id && r.userEmail === user.email);
      if (exists) {
        alert(t('userMenu.alreadyRegistered'));
        return;
      }
    } catch (e) {
      console.error('Error checking registration:', e);
    }
    // Abrir el formulario
    onOpenForm();
  };

  return (
    <button
      onClick={handleJoin}
      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      {t('modal.registrarse') || 'Unirse al proyecto'}
    </button>
  );
}
