# 📊 Resumen de Migración a Supabase - Reforestación Manabí

## ✅ Archivos Creados

### 1. **supabase-schema.sql** 
Base de datos completa con:
- ✅ 6 tablas principales
- ✅ Row Level Security (RLS) habilitado
- ✅ Triggers automáticos para `updated_at`
- ✅ Vistas para estadísticas
- ✅ Funciones útiles
- ✅ Índices para optimización

### 2. **src/lib/supabase.js**
Cliente configurado con funciones para:
- ✅ Autenticación (signUp, signIn, signOut)
- ✅ Gestión de proyectos
- ✅ Registros a eventos
- ✅ Asistencias
- ✅ Peticiones de proyectos
- ✅ Estadísticas
- ✅ Subscripciones en tiempo real

### 3. **GUIA_SUPABASE.md**
Guía completa paso a paso para configurar Supabase

### 4. **.env.local.example**
Template para variables de entorno

---

## 🗄️ Estructura de Base de Datos

### Tabla: `usuarios`
Almacena información de usuarios registrados
```
- id (UUID)
- email (único)
- nombre
- password_hash
- telefono
- ciudad
- avatar
- role (volunteer | organizer | admin)
- organization_name (para organizadores)
- organization_website (para organizadores)
- login_attempts (seguridad)
- locked_until (seguridad)
- created_at, updated_at, last_login
```

### Tabla: `proyectos`
Información de proyectos de reforestación
```
- id (UUID)
- nombre
- ubicacion
- descripcion
- lat, lng (coordenadas)
- fecha
- arboles (objetivo)
- voluntarios_esperados
- especies (array)
- estado (Próximo | Activo | Completado | Cancelado)
- created_by (referencia a usuarios)
- created_at, updated_at
```

### Tabla: `proyecto_organizadores`
Relación muchos-a-muchos entre proyectos y organizadores
```
- id (UUID)
- proyecto_id → proyectos
- usuario_id → usuarios
- created_at
```

### Tabla: `event_registrations`
Registros de usuarios a eventos
```
- id (UUID)
- proyecto_id → proyectos
- usuario_id → usuarios
- user_email, user_name
- telefono
- edad
- experiencia (ninguna | basica | intermedia | avanzada)
- disponibilidad (completo | manana | tarde)
- transporte (propio | publico | compartido | necesito_recogida)
- comentarios
- estado (confirmado | cancelado | asistio)
- fecha_registro, fecha_cancelacion
```

### Tabla: `asistencias`
Registro de asistencia real y árboles plantados
```
- id (UUID)
- proyecto_id → proyectos
- usuario_id → usuarios
- registration_id → event_registrations
- user_email, user_name
- arboles_plantados
- fecha_registro, updated_at
```

### Tabla: `peticiones_proyectos`
Peticiones de usuarios para crear nuevos proyectos
```
- id (UUID)
- usuario_id → usuarios
- nombre, ubicacion, lat, lng
- fecha
- arboles, voluntarios
- especies, descripcion
- estado (pendiente | aprobado | rechazado)
- respuesta_admin
- revisado_por → usuarios
- fecha_revision
- created_at, updated_at
```

---

## 🔐 Seguridad (Row Level Security)

### Políticas Implementadas:

#### Usuarios
- ✅ Los usuarios solo ven su propio perfil
- ✅ Los usuarios solo pueden actualizar su propio perfil
- ✅ Los admins pueden ver todos los usuarios

#### Proyectos
- ✅ Todos pueden ver proyectos
- ✅ Solo admins y organizadores pueden crear proyectos
- ✅ Solo admins y creadores pueden editar proyectos
- ✅ Solo admins pueden eliminar proyectos

#### Registros
- ✅ Los usuarios solo ven sus propios registros
- ✅ Los usuarios solo pueden crear/actualizar sus registros
- ✅ Los admins pueden ver todos los registros

#### Asistencias
- ✅ Los usuarios solo ven sus propias asistencias
- ✅ Los usuarios solo pueden crear/actualizar sus asistencias
- ✅ Los admins pueden ver todas las asistencias

#### Peticiones
- ✅ Los usuarios solo ven sus propias peticiones
- ✅ Los usuarios pueden crear peticiones
- ✅ Los admins pueden ver y actualizar todas las peticiones

---

## 📈 Vistas y Funciones

### Vistas Creadas:

#### `vista_estadisticas_proyectos`
Estadísticas agregadas por proyecto:
- Total de registros confirmados
- Total de asistencias registradas
- Árboles plantados reales
- Porcentaje de completado

#### `vista_impacto_usuarios`
Impacto agregado por usuario:
- Proyectos registrados
- Proyectos asistidos
- Total de árboles plantados

### Funciones Creadas:

#### `get_user_active_registrations(user_id)`
Obtiene todos los registros activos de un usuario

#### `is_user_registered_in_project(user_id, project_id)`
Verifica si un usuario ya está registrado en un proyecto

#### `get_global_statistics()`
Calcula estadísticas globales del sistema:
- Total proyectos, usuarios, voluntarios
- Total registros y asistencias
- Total árboles plantados
- Proyectos por estado

---

## 🔄 Mapeo de Datos (localStorage → Supabase)

### Antes (localStorage)
```javascript
localStorage.setItem('authUser', JSON.stringify({
  name: 'Usuario',
  email: 'email@ejemplo.com',
  role: 'volunteer'
}));
```

### Ahora (Supabase)
```javascript
import { signIn, getCurrentUser } from '@/lib/supabase';

// Login
const { data, error } = await signIn({ 
  email, 
  password 
});

// Obtener usuario actual
const user = await getCurrentUser();
```

---

## 🚀 Próximos Pasos para Implementación

### Fase 1: Configuración Inicial ✅ COMPLETADO
- ✅ Instalar @supabase/supabase-js
- ✅ Crear cliente de Supabase
- ✅ Crear schema SQL
- ✅ Crear funciones helper

### Fase 2: Configurar Supabase (TÚ DEBES HACER)
1. Crear cuenta en Supabase
2. Crear proyecto
3. Ejecutar `supabase-schema.sql`
4. Crear archivo `.env.local` con tus credenciales
5. Crear usuario admin

### Fase 3: Adaptar Formularios (OPCIONAL)
Los formularios actuales seguirán funcionando con localStorage.
Cuando estés listo para migrar, puedes:

1. **LoginForm.js** → Usar `signIn()` de supabase.js
2. **RegisterForm.js** → Usar `signUp()` de supabase.js
3. **MapaProyectos.jsx** → Usar `getProyectos()` de supabase.js
4. **FormularioUnirseEvento.jsx** → Usar `registrarEnEvento()` de supabase.js
5. **ProfileForm.js** → Usar `updateUserProfile()` de supabase.js

---

## 📝 Notas Importantes

### 1. Migración Gradual
No necesitas migrar todo de una vez. Puedes:
- Mantener localStorage para desarrollo local
- Usar Supabase solo para producción
- Migrar formulario por formulario

### 2. Contraseñas
El schema espera contraseñas hasheadas. Opciones:
- Usar Supabase Auth (recomendado) - maneja el hashing automáticamente
- Usar bcrypt manualmente si prefieres

### 3. UUIDs
Supabase usa UUIDs en lugar de IDs numéricos:
- Mejor para escalabilidad
- Más seguros
- No secuenciales

### 4. Tiempo Real
Ya está configurado para subscripciones en tiempo real:
```javascript
import { subscribeToProyectos } from '@/lib/supabase';

const subscription = subscribeToProyectos((payload) => {
  console.log('Proyecto actualizado:', payload);
});
```

---

## 🎯 Ventajas de Esta Implementación

1. **✅ Base de Datos Profesional**: PostgreSQL en lugar de localStorage
2. **✅ Seguridad Robusta**: RLS a nivel de base de datos
3. **✅ Escalable**: Soporta miles de usuarios
4. **✅ Tiempo Real**: Actualizaciones automáticas
5. **✅ Backup Automático**: Supabase hace backups diarios
6. **✅ API RESTful**: Generada automáticamente
7. **✅ Autenticación Integrada**: Sistema completo de auth
8. **✅ Optimizada**: Índices y vistas pre-calculadas

---

## 📞 Ayuda

- **Documentación**: Ver `GUIA_SUPABASE.md`
- **Schema**: Ver `supabase-schema.sql`
- **Funciones**: Ver `src/lib/supabase.js`
- **Docs Supabase**: https://supabase.com/docs

---

## ✨ ¡Todo Listo!

Tu proyecto ahora tiene:
1. ✅ Schema SQL completo y listo para ejecutar
2. ✅ Cliente de Supabase configurado
3. ✅ Funciones helper para todas las operaciones
4. ✅ Guía paso a paso para configuración
5. ✅ Seguridad implementada con RLS
6. ✅ Funciones y vistas optimizadas

**Solo falta que configures tu cuenta de Supabase siguiendo `GUIA_SUPABASE.md`** 🚀
