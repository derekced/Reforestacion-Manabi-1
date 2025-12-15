// Configuración del cliente de Supabase - Versión 2.0
// Con Supabase Auth y nuevas funcionalidades

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validar variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️  SUPABASE NO CONFIGURADO');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Por favor configura las siguientes variables en .env.local:');
  console.error('');
  console.error('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key');
  console.error('');
  console.error('Consulta CONFIGURACION_FINAL.md para instrucciones detalladas.');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Crear cliente de Supabase solo si las variables están configuradas
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// ============================================
// FUNCIONES DE AUTENTICACIÓN (Supabase Auth)
// ============================================

/**
 * Registrar nuevo usuario con Supabase Auth
 */
export async function signUp({ email, password, options = {} }) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado. Configura las variables de entorno.') };
  }
  try {
    const { nombre, telefono, ciudad, role = 'volunteer', organizationName, organizationWebsite } = options.data || {};
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
        data: {
          nombre,
          telefono,
          ciudad,
          role,
          organizationName,
          organizationWebsite
        }
      }
    });

    if (authError) throw authError;

    return { data: authData, error: null };
  } catch (error) {
    console.error('Error en signUp:', error);
    return { data: null, error };
  }
}

/**
 * Iniciar sesión con Supabase Auth
 */
export async function signIn({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Actualizar last_login
    if (data.user) {
      await supabase
        .from('perfiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error en signIn:', error);
    return { data: null, error };
  }
}

/**
 * Cerrar sesión
 * Limpia tanto Supabase Auth como localStorage
 */
export async function signOut() {
  // Limpiar localStorage primero
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authUser');
    console.log('🚪 localStorage limpiado');
  }
  
  // Cerrar sesión de Supabase si está configurado
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
  
  return { error: null };
}

/**
 * Obtener usuario actual con perfil completo
 * MODO HÍBRIDO: Intenta Supabase Auth primero, luego localStorage como fallback
 */
export async function getCurrentUser() {
  console.log('👤 getCurrentUser: Iniciando...');
  
  // PRIMERO: Verificar localStorage (más rápido y sistema actual)
  if (typeof window !== 'undefined') {
    try {
      const authUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
      if (authUser) {
        const user = JSON.parse(authUser);
        console.log('✅ Usuario encontrado en localStorage:', user.email);
        // Convertir formato localStorage a formato Supabase
        return {
          id: user.id || user.email,
          email: user.email,
          user_metadata: {
            nombre: user.nombre,
            role: user.role,
            avatar: user.avatar,
            telefono: user.telefono,
            ciudad: user.ciudad
          },
          profile: {
            id: user.id || user.email,
            email: user.email,
            nombre: user.nombre,
            role: user.role,
            avatar: user.avatar || '/avatars/user.jpg',
            telefono: user.telefono,
            ciudad: user.ciudad
          }
        };
      } else {
        console.log('❌ No hay datos en localStorage');
      }
    } catch (error) {
      console.error('❌ Error al cargar de localStorage:', error);
    }
  }
  
  // SEGUNDO: Si no hay en localStorage, intentar con Supabase Auth
  if (supabase) {
    console.log('👤 getCurrentUser: Intentando con Supabase Auth...');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 getCurrentUser: Respuesta Supabase:', { user: !!user, error: !!authError });
      
      if (!authError && user) {
        console.log('👤 getCurrentUser: Usuario encontrado en Supabase');
        // Intentar obtener perfil de la tabla, si falla usar metadata
        try {
          const { data: profile, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.warn('👤 No se pudo cargar perfil de BD, usando metadata:', profileError);
            // Crear objeto profile desde metadata
            return { 
              ...user, 
              profile: {
                id: user.id,
                email: user.email,
                nombre: user.user_metadata?.nombre || user.email,
                role: user.user_metadata?.role || 'volunteer',
                avatar: user.user_metadata?.avatar || '/avatars/user.jpg',
                telefono: user.user_metadata?.telefono,
                ciudad: user.user_metadata?.ciudad
              }
            };
          }

          console.log('👤 getCurrentUser: Perfil cargado desde BD');
          return { ...user, profile };
        } catch (error) {
          console.warn('👤 Error al cargar perfil:', error);
          // Fallback a metadata
          return { 
            ...user, 
            profile: {
              id: user.id,
              email: user.email,
              nombre: user.user_metadata?.nombre || user.email,
              role: user.user_metadata?.role || 'volunteer',
              avatar: user.user_metadata?.avatar || '/avatars/user.jpg',
              telefono: user.user_metadata?.telefono,
              ciudad: user.user_metadata?.ciudad
            }
          };
        }
      }
    } catch (error) {
      console.warn('👤 Error con Supabase Auth:', error);
    }
  } else {
    console.log('👤 getCurrentUser: Supabase no configurado');
  }
  
  console.log('❌ getCurrentUser: No se encontró usuario en ningún lado');
  return null;
}

/**
 * Actualizar perfil de usuario
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('perfiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Obtener perfiles por rol
 */
export async function getPerfilesByRole(role) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, email, role, ciudad, organization_name')
    .eq('role', role)
    .order('nombre');

  return { data, error };
}

/**
 * Restablecer contraseña
 */
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  return { data, error };
}

/**
 * Actualizar contraseña
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  return { data, error };
}

// ============================================
// FUNCIONES DE PROYECTOS
// ============================================

export async function getProyectos(filtroEstado = null) {
  let query = supabase
    .from('proyectos')
    .select('*, proyecto_organizadores(usuario_id)')
    .order('fecha', { ascending: false });

  if (filtroEstado && filtroEstado !== 'Todos') {
    query = query.eq('estado', filtroEstado);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getProyectoById(id) {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function createProyecto(proyectoData) {
  const { data, error } = await supabase
    .from('proyectos')
    .insert([proyectoData])
    .select()
    .single();

  return { data, error };
}

export async function updateProyecto(id, updates) {
  const { data, error } = await supabase
    .from('proyectos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteProyecto(id) {
  const { error } = await supabase
    .from('proyectos')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getEstadisticasProyectos() {
  const { data, error } = await supabase
    .from('vista_estadisticas_proyectos')
    .select('*');

  return { data, error };
}

// ============================================
// FUNCIONES DE REGISTROS A EVENTOS
// ============================================

export async function registrarEnEvento(registroData) {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([registroData])
    .select()
    .single();

  return { data, error };
}

export async function verificarRegistro(userId, projectId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('usuario_id', userId)
    .eq('proyecto_id', projectId)
    .eq('estado', 'confirmado')
    .maybeSingle(); // Usar maybeSingle() en lugar de single() para evitar error cuando no hay resultados

  // Si hay error de BD real, retornarlo
  if (error) {
    return { data: null, error };
  }
  
  // Si data es null, significa que no está registrado
  // Si data tiene valor, significa que sí está registrado
  return { data, error: null };
}

export async function getRegistrosUsuario(userId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select(`
      *,
      proyectos (*)
    `)
    .eq('usuario_id', userId)
    .eq('estado', 'confirmado')
    .order('fecha_registro', { ascending: false });

  return { data, error };
}

export async function getRegistrosProyecto(projectId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('proyecto_id', projectId)
    .eq('estado', 'confirmado')
    .order('fecha_registro', { ascending: false });

  return { data, error };
}

export async function cancelarRegistro(registrationId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .update({
      estado: 'cancelado',
      fecha_cancelacion: new Date().toISOString()
    })
    .eq('id', registrationId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE ASISTENCIAS
// ============================================

export async function registrarAsistencia(asistenciaData) {
  // Obtener usuario actual si no se provee
  if (!asistenciaData.usuario_id || !asistenciaData.user_email) {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: new Error('Usuario no autenticado') };
    }
    
    asistenciaData.usuario_id = user.id || user.profile?.id;
    asistenciaData.user_email = user.email;
    asistenciaData.user_name = user.profile?.nombre || user.user_metadata?.nombre || user.email;
  }

  const { data, error } = await supabase
    .from('asistencias')
    .upsert([asistenciaData], {
      onConflict: 'proyecto_id,usuario_id'
    })
    .select()
    .single();

  return { data, error };
}

export async function getAsistenciasUsuario(userId) {
  // Si Supabase está configurado, usar la base de datos
  if (supabase) {
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        proyectos (*)
      `)
      .eq('usuario_id', userId)
      .order('fecha_registro', { ascending: false });

    return { data, error };
  }
  
  // FALLBACK: Si no hay Supabase, intentar con localStorage
  if (typeof window !== 'undefined') {
    try {
      const asistenciasData = localStorage.getItem('asistencias');
      if (asistenciasData) {
        const allAsistencias = JSON.parse(asistenciasData);
        const userAsistencias = allAsistencias.filter(a => a.usuario_id === userId);
        return { data: userAsistencias, error: null };
      }
    } catch (error) {
      console.error('Error al cargar asistencias de localStorage:', error);
    }
  }
  
  // Si no hay datos, devolver array vacío
  return { data: [], error: null };
}

export async function getAsistenciasProyecto(projectId) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('proyecto_id', projectId)
    .order('fecha_registro', { ascending: false });

  return { data, error };
}

export async function verificarAsistencia(userId, projectId) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('usuario_id', userId)
    .eq('proyecto_id', projectId)
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE PETICIONES DE PROYECTOS
// ============================================

export async function crearPeticionProyecto(peticionData) {
  const { data, error } = await supabase
    .from('peticiones_proyectos')
    .insert([peticionData])
    .select()
    .single();

  return { data, error };
}

export async function getPeticiones(estado = null) {
  let query = supabase
    .from('peticiones_proyectos')
    .select(`
      *,
      perfiles!peticiones_proyectos_usuario_id_fkey (nombre, email)
    `)
    .order('created_at', { ascending: false });

  if (estado) {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getPeticionesUsuario(userId) {
  const { data, error } = await supabase
    .from('peticiones_proyectos')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function updatePeticion(peticionId, updates) {
  const { data, error } = await supabase
    .from('peticiones_proyectos')
    .update(updates)
    .eq('id', peticionId)
    .select()
    .single();

  return { data, error };
}

export async function aprobarPeticion(peticionId, adminId, respuesta = '') {
  const { data, error } = await supabase
    .from('peticiones_proyectos')
    .update({
      estado: 'aprobado',
      revisado_por: adminId,
      respuesta_admin: respuesta,
      fecha_revision: new Date().toISOString()
    })
    .eq('id', peticionId)
    .select()
    .single();

  return { data, error };
}

export async function rechazarPeticion(peticionId, adminId, respuesta) {
  const { data, error } = await supabase
    .from('peticiones_proyectos')
    .update({
      estado: 'rechazado',
      revisado_por: adminId,
      respuesta_admin: respuesta,
      fecha_revision: new Date().toISOString()
    })
    .eq('id', peticionId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE DONACIONES
// ============================================

export async function crearDonacion(donacionData) {
  const { data, error } = await supabase
    .from('donaciones')
    .insert([donacionData])
    .select()
    .single();

  return { data, error };
}

export async function getDonacionesUsuario(userId) {
  const { data, error } = await supabase
    .from('donaciones')
    .select(`
      *,
      proyectos (nombre, ubicacion)
    `)
    .eq('usuario_id', userId)
    .order('fecha_donacion', { ascending: false });

  return { data, error };
}

export async function getDonacionesProyecto(projectId) {
  const { data, error } = await supabase
    .from('donaciones')
    .select('*')
    .eq('proyecto_id', projectId)
    .eq('estado', 'completado')
    .order('fecha_donacion', { ascending: false });

  return { data, error };
}

export async function actualizarEstadoDonacion(donacionId, estado, transactionId = null) {
  const updates = {
    estado,
    fecha_procesado: new Date().toISOString()
  };
  
  if (transactionId) {
    updates.transaction_id = transactionId;
  }

  const { data, error } = await supabase
    .from('donaciones')
    .update(updates)
    .eq('id', donacionId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE MÉTODOS DE PAGO
// ============================================

export async function agregarMetodoPago(metodoPagoData) {
  const { data, error } = await supabase
    .from('metodos_pago')
    .insert([metodoPagoData])
    .select()
    .single();

  return { data, error };
}

export async function getMetodosPagoUsuario(userId) {
  const { data, error } = await supabase
    .from('metodos_pago')
    .select('*')
    .eq('usuario_id', userId)
    .eq('esta_activo', true)
    .order('es_predeterminado', { ascending: false });

  return { data, error };
}

export async function establecerMetodoPagoPredeterminado(userId, metodoPagoId) {
  // Primero, quitar predeterminado de todos
  await supabase
    .from('metodos_pago')
    .update({ es_predeterminado: false })
    .eq('usuario_id', userId);

  // Luego, establecer el nuevo
  const { data, error } = await supabase
    .from('metodos_pago')
    .update({ es_predeterminado: true })
    .eq('id', metodoPagoId)
    .select()
    .single();

  return { data, error };
}

export async function eliminarMetodoPago(metodoPagoId) {
  const { data, error } = await supabase
    .from('metodos_pago')
    .update({ esta_activo: false })
    .eq('id', metodoPagoId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE SOLICITUDES DE ORGANIZADOR
// ============================================

export async function crearSolicitudOrganizador(solicitudData) {
  const { data, error } = await supabase
    .from('solicitudes_organizador')
    .insert([solicitudData])
    .select()
    .single();

  return { data, error };
}

export async function getSolicitudesOrganizador(estado = null) {
  let query = supabase
    .from('solicitudes_organizador')
    .select(`
      *,
      perfiles!solicitudes_organizador_usuario_id_fkey (nombre, email)
    `)
    .order('created_at', { ascending: false });

  if (estado) {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getSolicitudOrganizadorUsuario(userId) {
  const { data, error } = await supabase
    .from('solicitudes_organizador')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

export async function aprobarSolicitudOrganizador(solicitudId, adminId, comentarios) {
  const { error } = await supabase
    .rpc('aprobar_solicitud_organizador', {
      solicitud_id_param: solicitudId,
      admin_id_param: adminId,
      comentarios_param: comentarios
    });

  return { error };
}

export async function rechazarSolicitudOrganizador(solicitudId, adminId, comentarios) {
  const { data, error } = await supabase
    .from('solicitudes_organizador')
    .update({
      estado: 'rechazado',
      revisado_por: adminId,
      fecha_revision: new Date().toISOString(),
      comentarios_revision: comentarios
    })
    .eq('id', solicitudId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE PRÉSTAMOS
// ============================================

export async function crearSolicitudPrestamo(prestamoData) {
  const { data, error } = await supabase
    .from('prestamos')
    .insert([prestamoData])
    .select()
    .single();

  return { data, error };
}

export async function getPrestamosUsuario(userId) {
  const { data, error } = await supabase
    .from('prestamos')
    .select(`
      *,
      proyectos (nombre, ubicacion, fecha)
    `)
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getPrestamos(estado = null) {
  let query = supabase
    .from('prestamos')
    .select(`
      *,
      perfiles!prestamos_usuario_id_fkey (nombre, email),
      proyectos (nombre, ubicacion)
    `)
    .order('created_at', { ascending: false });

  if (estado) {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function aprobarPrestamo(prestamoId, adminId, comentarios) {
  const { data, error } = await supabase
    .from('prestamos')
    .update({
      estado: 'aprobado',
      aprobado_por: adminId,
      fecha_aprobacion: new Date().toISOString(),
      comentarios_admin: comentarios
    })
    .eq('id', prestamoId)
    .select()
    .single();

  return { data, error };
}

export async function actualizarEstadoPrestamo(prestamoId, estado, datosDevolucion = {}) {
  const updates = { estado };
  
  if (estado === 'devuelto' && datosDevolucion) {
    updates.fecha_devolucion_real = datosDevolucion.fecha_devolucion_real || new Date().toISOString();
    updates.condicion_devolucion = datosDevolucion.condicion_devolucion;
    updates.notas_devolucion = datosDevolucion.notas_devolucion;
  }

  const { data, error } = await supabase
    .from('prestamos')
    .update(updates)
    .eq('id', prestamoId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE REPORTES DE INCIDENTES
// ============================================

export async function crearReporteIncidente(incidenteData) {
  const { data, error } = await supabase
    .from('reportes_incidentes')
    .insert([incidenteData])
    .select()
    .single();

  return { data, error };
}

export async function getReportesUsuario(userId) {
  const { data, error } = await supabase
    .from('reportes_incidentes')
    .select(`
      *,
      proyectos (nombre, ubicacion)
    `)
    .eq('reportado_por', userId)
    .order('fecha_incidente', { ascending: false });

  return { data, error };
}

export async function getReportesIncidentes(filtros = {}) {
  let query = supabase
    .from('reportes_incidentes')
    .select(`
      *,
      perfiles!reportes_incidentes_reportado_por_fkey (nombre, email),
      proyectos (nombre, ubicacion)
    `)
    .order('fecha_incidente', { ascending: false });

  if (filtros.tipo_incidente) {
    query = query.eq('tipo_incidente', filtros.tipo_incidente);
  }
  if (filtros.severidad) {
    query = query.eq('severidad', filtros.severidad);
  }
  if (filtros.estado) {
    query = query.eq('estado', filtros.estado);
  }
  if (filtros.proyecto_id) {
    query = query.eq('proyecto_id', filtros.proyecto_id);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function asignarIncidente(incidenteId, adminId) {
  const { data, error } = await supabase
    .from('reportes_incidentes')
    .update({
      asignado_a: adminId,
      fecha_asignacion: new Date().toISOString(),
      estado: 'en_investigacion'
    })
    .eq('id', incidenteId)
    .select()
    .single();

  return { data, error };
}

export async function resolverIncidente(incidenteId, resolucion) {
  const { data, error } = await supabase
    .from('reportes_incidentes')
    .update({
      estado: 'resuelto',
      resolucion,
      fecha_resolucion: new Date().toISOString()
    })
    .eq('id', incidenteId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE RECOMENDACIONES DE MEJORA
// ============================================

export async function crearRecomendacion(recomendacionData) {
  const { data, error } = await supabase
    .from('recomendaciones_mejora')
    .insert([recomendacionData])
    .select()
    .single();

  return { data, error };
}

export async function getRecomendaciones(filtros = {}) {
  let query = supabase
    .from('recomendaciones_mejora')
    .select(`
      *,
      perfiles (nombre, email)
    `)
    .order('created_at', { ascending: false });

  if (filtros.categoria) {
    query = query.eq('categoria', filtros.categoria);
  }
  if (filtros.estado) {
    query = query.eq('estado', filtros.estado);
  }
  if (filtros.prioridad_asignada) {
    query = query.eq('prioridad_asignada', filtros.prioridad_asignada);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function votarRecomendacion(recomendacionId, tipoVoto) {
  const campo = tipoVoto === 'positivo' ? 'votos_positivos' : 'votos_negativos';
  
  const { data, error } = await supabase
    .rpc('increment', {
      row_id: recomendacionId,
      table_name: 'recomendaciones_mejora',
      column_name: campo
    });

  return { data, error };
}

export async function actualizarEstadoRecomendacion(recomendacionId, estado, datos = {}) {
  const updates = { estado, ...datos };

  const { data, error } = await supabase
    .from('recomendaciones_mejora')
    .update(updates)
    .eq('id', recomendacionId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================

export async function getEstadisticasGlobales() {
  try {
    // Contar proyectos
    const { count: totalProyectos, error: errorProyectos } = await supabase
      .from('proyectos')
      .select('*', { count: 'exact', head: true });

    if (errorProyectos) throw errorProyectos;

    // Contar árboles plantados (suma de árboles de proyectos completados)
    const { data: proyectosCompletados, error: errorArboles } = await supabase
      .from('proyectos')
      .select('arboles')
      .eq('estado', 'Completado');

    if (errorArboles) throw errorArboles;

    const arbolesPlantados = (proyectosCompletados || []).reduce(
      (sum, p) => sum + (p.arboles || 0), 
      0
    );

    // Contar voluntarios únicos registrados
    const { data: registros, error: errorVoluntarios } = await supabase
      .from('event_registrations')
      .select('usuario_id');

    if (errorVoluntarios) throw errorVoluntarios;

    const voluntariosUnicos = new Set(
      (registros || []).map(r => r.usuario_id).filter(Boolean)
    ).size;

    return {
      data: {
        total_proyectos: totalProyectos || 0,
        arboles_plantados: arbolesPlantados,
        voluntarios_unicos: voluntariosUnicos
      },
      error: null
    };
  } catch (error) {
    console.error('Error en getEstadisticasGlobales:', error);
    return { data: null, error };
  }
}

export async function getImpactoUsuario(userId) {
  try {
    // Obtener asistencias confirmadas del usuario
    const { data: asistencias, error: errorAsistencias } = await supabase
      .from('asistencias')
      .select(`
        id,
        proyecto_id,
        arboles_plantados,
        proyectos (
          nombre,
          fecha,
          ubicacion,
          arboles
        )
      `)
      .eq('usuario_id', userId)
      .eq('confirmada', true);

    if (errorAsistencias) throw errorAsistencias;

    // Calcular total de árboles plantados
    const totalArboles = (asistencias || []).reduce(
      (sum, a) => sum + (a.arboles_plantados || 0),
      0
    );

    // Contar proyectos únicos donde ha participado
    const proyectosParticipados = new Set(
      (asistencias || []).map(a => a.proyecto_id)
    ).size;

    return {
      data: {
        total_arboles: totalArboles,
        proyectos_participados: proyectosParticipados,
        asistencias: asistencias || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error en getImpactoUsuario:', error);
    return { data: null, error };
  }
}

export async function getDashboardAdmin() {
  try {
    // Obtener estadísticas globales
    const estadisticas = await getEstadisticasGlobales();
    if (estadisticas.error) throw estadisticas.error;

    // Contar usuarios por rol
    const { data: perfiles, error: errorPerfiles } = await supabase
      .from('perfiles')
      .select('role');

    if (errorPerfiles) throw errorPerfiles;

    const usuariosPorRol = (perfiles || []).reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {});

    // Contar peticiones pendientes
    const { count: peticionesPendientes, error: errorPeticiones } = await supabase
      .from('peticiones_proyectos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente');

    if (errorPeticiones) throw errorPeticiones;

    return {
      data: {
        ...estadisticas.data,
        total_usuarios: perfiles?.length || 0,
        usuarios_voluntarios: usuariosPorRol.volunteer || 0,
        usuarios_organizadores: usuariosPorRol.organizer || 0,
        usuarios_admins: usuariosPorRol.admin || 0,
        peticiones_pendientes: peticionesPendientes || 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error en getDashboardAdmin:', error);
    return { data: null, error };
  }
}

export async function getActividadReciente(limit = 10) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select(`
      id,
      user_name,
      fecha_registro,
      proyectos (nombre)
    `)
    .eq('estado', 'confirmado')
    .order('fecha_registro', { ascending: false })
    .limit(limit);

  return { data, error };
}

// ============================================
// SUBSCRIPCIONES EN TIEMPO REAL
// ============================================

export function subscribeToProyectos(callback) {
  return supabase
    .channel('proyectos-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'proyectos' }, 
      callback
    )
    .subscribe();
}

export function subscribeToRegistrations(callback) {
  return supabase
    .channel('registrations-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'event_registrations' }, 
      callback
    )
    .subscribe();
}

export function subscribeToDonaciones(callback) {
  return supabase
    .channel('donaciones-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'donaciones' }, 
      callback
    )
    .subscribe();
}

export function subscribeToIncidentes(callback) {
  return supabase
    .channel('incidentes-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'reportes_incidentes' }, 
      callback
    )
    .subscribe();
}

export function unsubscribe(subscription) {
  supabase.removeChannel(subscription);
}

// ============================================
// FUNCIONES DE ALMACENAMIENTO (Storage)
// ============================================

/**
 * Subir archivo a Supabase Storage
 */
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) return { data: null, error };

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { data: { ...data, publicUrl }, error: null };
}

/**
 * Eliminar archivo de Supabase Storage
 */
export async function deleteFile(bucket, path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  return { data, error };
}

/**
 * Obtener URL pública de un archivo
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}
