/**
 * Utilidades para manejar proyectos de reforestación
 */

/**
 * Convierte el estado de un proyecto de inglés a español
 * @param {string} estado - Estado en inglés ('upcoming', 'in_progress', 'completed')
 * @returns {string} - Estado en español ('Próximo', 'Activo', 'Completado')
 */
export const convertirEstado = (estado) => {
  const estadoMap = {
    'upcoming': 'Próximo',
    'in_progress': 'Activo',
    'completed': 'Completado'
  };
  return estadoMap[estado] || estado;
};

/**
 * Convierte el estado de un proyecto de español a inglés
 * @param {string} estado - Estado en español ('Próximo', 'Activo', 'Completado')
 * @returns {string} - Estado en inglés ('upcoming', 'in_progress', 'completed')
 */
export const convertirEstadoAIngles = (estado) => {
  const estadoMap = {
    'Próximo': 'upcoming',
    'Activo': 'in_progress',
    'Completado': 'completed'
  };
  return estadoMap[estado] || estado;
};

/**
 * Carga proyectos desde localStorage y convierte los estados a español
 * @returns {Array} - Array de proyectos con estados en español
 */
export const cargarProyectos = () => {
  if (typeof window === 'undefined') return [];
  
  const savedProjects = localStorage.getItem('proyectos');
  if (!savedProjects) return [];
  
  try {
    const projects = JSON.parse(savedProjects);
    return projects.map(p => ({
      ...p,
      estado: convertirEstado(p.estado),
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lng),
      arboles: parseInt(p.arboles),
      voluntarios: parseInt(p.voluntarios),
      especies: Array.isArray(p.especies) 
        ? p.especies 
        : (p.especies || '').split(',').map(e => e.trim()).filter(e => e),
      organizers: Array.isArray(p.organizers) 
        ? p.organizers 
        : (p.organizers ? String(p.organizers).split(',').map(s => s.trim()).filter(s => s) : [])
    }));
  } catch (error) {
    console.error('Error al cargar proyectos:', error);
    return [];
  }
};

/**
 * Guarda proyectos en localStorage, convirtiendo los estados a inglés
 * @param {Array} proyectos - Array de proyectos con estados en español
 */
export const guardarProyectos = (proyectos) => {
  if (typeof window === 'undefined') return;
  
  try {
    const proyectosParaGuardar = proyectos.map(p => ({
      ...p,
      estado: convertirEstadoAIngles(p.estado)
    }));
    localStorage.setItem('proyectos', JSON.stringify(proyectosParaGuardar));
    console.log('💾 Proyectos guardados en localStorage:', proyectosParaGuardar.length, 'proyectos');
  } catch (error) {
    console.error('Error al guardar proyectos:', error);
  }
};

/**
 * Obtiene el color asociado a un estado
 * @param {string} estado - Estado del proyecto (en español o inglés)
 * @returns {Object} - Objeto con clases de color para diferentes estilos
 */
export const obtenerColoresEstado = (estado) => {
  const estadoNormalizado = convertirEstado(estado);
  
  const colores = {
    'Completado': {
      badge: 'bg-green-600 text-white border border-green-700 dark:bg-green-700 dark:border-green-600',
      marker: '#10b981',
      ring: 'ring-green-500',
      icon: '✔'
    },
    'Activo': {
      badge: 'bg-blue-600 text-white border border-blue-700 dark:bg-blue-700 dark:border-blue-600',
      marker: '#3b82f6',
      ring: 'ring-blue-500',
      icon: '●'
    },
    'Próximo': {
      badge: 'bg-amber-500 text-white border border-amber-600 dark:bg-amber-600 dark:border-amber-500',
      marker: '#f59e0b',
      ring: 'ring-yellow-500',
      icon: '◆'
    }
  };
  
  return colores[estadoNormalizado] || {
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    marker: '#6b7280',
    ring: 'ring-gray-500',
    icon: '•'
  };
};
