# 🚀 Configuración Final - Migración a Supabase

## ✅ Archivos Migrados

### 1. **LoginForm.js** ✅
- ✅ Importa `signIn` y `getCurrentUser` de `@/lib/supabase-v2`
- ✅ Usa Supabase Auth para autenticación
- ✅ Eliminado localStorage para auth
- ✅ Manejo de errores de Supabase (credenciales inválidas, email no confirmado)

### 2. **RegisterForm.js** ✅
- ✅ Importa `signUp` y `getCurrentUser` de `@/lib/supabase-v2`
- ✅ Crea usuario en auth.users con metadata (nombre, teléfono, ciudad, role, etc.)
- ✅ Trigger `handle_new_user()` crea perfil automáticamente en tabla `perfiles`
- ✅ Confirmación por email habilitada
- ✅ Eliminado localStorage para registro

## 📋 Pasos para Completar la Configuración

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto:
   - Nombre del proyecto: `reforestacion-manabi`
   - Database Password: (guarda esta contraseña)
   - Region: Selecciona la más cercana (ej: South America)
4. Espera 1-2 minutos mientras se crea el proyecto

### Paso 2: Ejecutar SQL Schema

1. En el dashboard de Supabase, ve a **SQL Editor** (icono en la barra lateral)
2. Haz clic en **+ New Query**
3. Abre el archivo `supabase-schema-v2.sql` en tu proyecto
4. Copia TODO el contenido (988 líneas)
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **Run** (esquina inferior derecha)
7. Verifica que todo se ejecutó correctamente (debería decir "Success")

**Esto creará:**
- ✅ 12 tablas (perfiles, proyectos, event_registrations, etc.)
- ✅ Trigger `handle_new_user()` para crear perfiles automáticamente
- ✅ Políticas RLS (Row Level Security) para todas las tablas
- ✅ Vistas y funciones auxiliares

### Paso 3: Configurar Variables de Entorno

1. En el dashboard de Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public key** (empieza con `eyJh...`)

3. Abre el archivo `.env.local` en tu proyecto
4. Reemplaza los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 4: Configurar Authentication

1. En Supabase, ve a **Authentication** → **Providers**
2. Asegúrate que **Email** esté habilitado
3. Ve a **Authentication** → **Email Templates**
4. Personaliza los templates de confirmación si deseas (opcional)

### Paso 5: Reiniciar Servidor de Desarrollo

```powershell
# Detener el servidor si está corriendo (Ctrl+C)

# Reinstalar dependencias si es necesario
pnpm install

# Reiniciar el servidor
pnpm dev
```

### Paso 6: Crear Usuario Administrador

Opción A - Usando el script:
```powershell
node scripts/create-admin.mjs
```

Opción B - Manualmente en Supabase:
1. Ve a **Authentication** → **Users**
2. Crea un nuevo usuario con:
   - Email: admin@reforestacion.com
   - Password: (tu contraseña segura)
3. En **SQL Editor**, ejecuta:
```sql
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'admin@reforestacion.com';

UPDATE perfiles 
SET role = 'admin' 
WHERE email = 'admin@reforestacion.com';
```

## 🧪 Pruebas

### Probar Registro:
1. Ve a `http://localhost:3000/register`
2. Completa el formulario con tus datos
3. Haz clic en "Crear cuenta"
4. Deberías recibir un email de confirmación
5. Verifica en Supabase → **Authentication** → **Users** que el usuario se creó
6. Verifica en Supabase → **Table Editor** → **perfiles** que el perfil se creó

### Probar Login:
1. Ve a `http://localhost:3000/login`
2. Ingresa email y contraseña
3. Si no confirmaste el email, verás mensaje "confirma tu email"
4. Si ya confirmaste, deberías ser redirigido al dashboard

### Verificar en Supabase:
- **Authentication** → **Users**: Ver usuarios registrados
- **Table Editor** → **perfiles**: Ver perfiles creados automáticamente
- **Logs** → **Auth**: Ver intentos de login/registro

## 🔍 Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente el `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Asegúrate de reiniciar el servidor después de cambiar `.env.local`

### Error: "Email not confirmed"
- Ve a **Authentication** → **Users** en Supabase
- Encuentra el usuario y haz clic en los "..." → **Confirm Email**
- O ejecuta: `UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'email@ejemplo.com';`

### No se crea el perfil automáticamente
- Verifica que el trigger `handle_new_user()` se ejecutó correctamente
- En **SQL Editor**, ejecuta: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Si no existe, vuelve a ejecutar la sección del trigger en `supabase-schema-v2.sql`

### Error de conexión a Supabase
- Verifica que el `NEXT_PUBLIC_SUPABASE_URL` es correcto
- Asegúrate que tu proyecto de Supabase está activo (no pausado)

## 📝 Archivos Pendientes de Migración

Los siguientes archivos aún usan localStorage y necesitan migración:

- [ ] `src/components/formu/ProfileForm.js` - Actualizar perfil
- [ ] `src/components/formu/RecuperarForm.js` - Recuperar contraseña
- [ ] `src/components/proyectos/MapaProyectos.jsx` - Listar proyectos
- [ ] `src/components/proyectos/FormularioUnirseEvento.jsx` - Registro a eventos
- [ ] `src/components/AdminDashboard.jsx` - Dashboard administrativo
- [ ] `src/app/profile/page.js` - Página de perfil
- [ ] `src/app/proyectos/page.js` - Página de proyectos
- [ ] `src/app/admin/page.js` - Página admin

## 🎯 Próximos Pasos

1. **Configurar Supabase** (completa Pasos 1-5 arriba)
2. **Probar Login/Registro** (verifica que funciona)
3. **Migrar ProfileForm.js** para edición de perfiles
4. **Migrar MapaProyectos.jsx** para mostrar proyectos de Supabase
5. **Migrar formularios de eventos** para usar tabla `event_registrations`

## 📚 Recursos

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Archivo `GUIA_SUPABASE_AUTH.md` - Guía detallada de autenticación
- Archivo `src/lib/supabase-v2.js` - Todas las funciones disponibles

---

**Nota:** Una vez que hayas completado la configuración, los usuarios podrán registrarse e iniciar sesión usando Supabase Auth. El perfil se creará automáticamente en la tabla `perfiles` gracias al trigger.
