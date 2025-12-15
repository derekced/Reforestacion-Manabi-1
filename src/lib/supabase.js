// Configuración del cliente de Supabase
import { createClient } from '@supabase/supabase-js';

// Variables de entorno - Debes reemplazar estos valores con los de tu proyecto Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Registrar nuevo usuario
 */
export async function signUp({ email, password, nombre, telefono, ciudad, role = 'volunteer', organizationName, organizationWebsite }) {
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          role
        }
      }
    });

    if (authError) throw authError;

    // 2. Crear perfil en tabla usuarios
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user.id,
            email,
            nombre,
            telefono,
            ciudad,
            role,
            organization_name: organizationName,
            organization_website: organizationWebsite
          }
        ]);

      if (profileError) throw profileError;
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Error en signUp:', error);
    return { data: null, error };
  }
}

/**
 * Iniciar sesión
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
        .from('usuarios')
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
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Obtener datos completos del perfil
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();

  return { ...user, profile };
}

/**
 * Actualizar perfil de usuario
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// ============================================
// FUNCIONES DE PROYECTOS
// ============================================

/**
 * Obtener todos los proyectos
 */
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

/**
 * Obtener un proyecto por ID
 */
export async function getProyectoById(id) {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

/**
 * Crear nuevo proyecto
 */
export async function createProyecto(proyectoData) {
  const { data, error } = await supabase
    .from('proyectos')
    .insert([proyectoData])
    .select()
    .single();

  return { data, error };
}

/**
 * Actualizar proyecto
 */
export async function updateProyecto(id, updates) {
  const { data, error } = await supabase
    .from('proyectos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Eliminar proyecto
 */
export async function deleteProyecto(id) {
  const { error } = await supabase
    .from('proyectos')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Obtener estadísticas de proyectos
 */
export async function getEstadisticasProyectos() {
  const { data, error } = await supabase
    .from('vista_estadisticas_proyectos')
    .select('*');

  return { data, error };
}

// ============================================
// FUNCIONES DE REGISTROS A EVENTOS
// ============================================

/**
 * Registrar usuario en un evento
 */
export async function registrarEnEvento(registroData) {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([registroData])
    .select()
    .single();

  return { data, error };
}

/**
 * Verificar si usuario está registrado en un proyecto
 */
export async function verificarRegistro(userId, projectId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('usuario_id', userId)
    .eq('proyecto_id', projectId)
    .eq('estado', 'confirmado')
    .single();

  return { data, error };
}

/**
 * Obtener registros de un usuario
 */
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

/**
 * Obtener registros de un proyecto
 */
export async function getRegistrosProyecto(projectId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('proyecto_id', projectId)
    .eq('estado', 'confirmado')
    .order('fecha_registro', { ascending: false });

  return { data, error };
}

/**
 * Cancelar registro
 */
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

/**
 * Registrar asistencia
 */
export async function registrarAsistencia(asistenciaData) {
  const { data, error } = await supabase
    .from('asistencias')
    .upsert([asistenciaData], {
      onConflict: 'proyecto_id,usuario_id'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Obtener asistencias de un usuario
 */
export async function getAsistenciasUsuario(userId) {
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

/**
 * Obtener asistencias de un proyecto
 */
export async function getAsistenciasProyecto(projectId) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('proyecto_id', projectId)
    .order('fecha_registro', { ascending: false });

  return { data, error };
}

/**
 * Verificar si usuario ya registró asistencia
 */
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
// FUNCIONES DE PETICIONES
// ============================================

/**
 * Crear petición de proyecto
 */
export async function crearPeticionProyecto(peticionData) {
  const { data, error } = await supabase
    .from('peticiones_proyectos')
    .insert([peticionData])
    .select()
    .single();

  return { data, error };
}

/**
 * Obtener todas las peticiones (admin)
 */
export async function getPeticiones(estado = null) {
  let query = supabase
    .from('peticiones_proyectos')
    .select(`
      *,
      usuarios!peticiones_proyectos_usuario_id_fkey (nombre, email)
    `)
    .order('created_at', { ascending: false });

  if (estado) {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Obtener peticiones de un usuario
 */
export async function getPeticionesUsuario(userId) {
  const { data, error } = await supabase
    .from('peticiones_proyectos')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Aprobar petición
 */
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

/**
 * Rechazar petición
 */
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
// FUNCIONES DE ESTADÍSTICAS
// ============================================

/**
 * Obtener estadísticas globales
 */
export async function getEstadisticasGlobales() {
  const { data, error } = await supabase
    .rpc('get_global_statistics');

  return { data, error };
}

/**
 * Obtener impacto de un usuario
 */
export async function getImpactoUsuario(userId) {
  const { data, error } = await supabase
    .from('vista_impacto_usuarios')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * Obtener actividad reciente
 */
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

/**
 * Suscribirse a cambios en proyectos
 */
export function subscribeToProyectos(callback) {
  return supabase
    .channel('proyectos-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'proyectos' }, 
      callback
    )
    .subscribe();
}

/**
 * Suscribirse a cambios en registros
 */
export function subscribeToRegistrations(callback) {
  return supabase
    .channel('registrations-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'event_registrations' }, 
      callback
    )
    .subscribe();
}

/**
 * Cancelar suscripción
 */
export function unsubscribe(subscription) {
  supabase.removeChannel(subscription);
}
