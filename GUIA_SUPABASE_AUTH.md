# 🚀 Guía Completa: Configuración de Supabase Auth + Nuevas Funcionalidades

## 📋 Índice
1. [Configuración Inicial de Supabase](#configuración-inicial)
2. [Configurar Supabase Auth](#configurar-auth)
3. [Ejecutar Schema SQL](#ejecutar-schema)
4. [Configurar Storage (Opcional)](#configurar-storage)
5. [Variables de Entorno](#variables-de-entorno)
6. [Crear Usuario Admin](#crear-usuario-admin)
7. [Probar la Configuración](#probar)

---

## 🎯 Configuración Inicial de Supabase

### Paso 1: Crear Proyecto
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en **"New Project"**
4. Completa:
   ```
   Name: reforestacion-manabi
   Database Password: [Genera una contraseña segura]
   Region: South America (São Paulo)
   Pricing Plan: Free
   ```
5. Espera 2-3 minutos

---

## 🔐 Configurar Supabase Auth

### Paso 1: Habilitar Email Auth
1. Ve a **Authentication** → **Providers**
2. **Email** debe estar habilitado (por defecto)
3. Configuración recomendada:
   ```
   ☑ Enable email provider
   ☐ Confirm email (deshabilita para desarrollo)
   ☑ Secure email change
   ☑ Enable email autoconfirm (para desarrollo)
   ```

### Paso 2: Configurar URL de Redirección
1. Ve a **Authentication** → **URL Configuration**
2. En **Site URL**: `http://localhost:3000`
3. En **Redirect URLs**: 
   ```
   http://localhost:3000/**
   https://tu-dominio-produccion.com/**
   ```

### Paso 3: Plantillas de Email (Opcional)
1. Ve a **Authentication** → **Email Templates**
2. Personaliza las plantillas de:
   - Confirmación de registro
   - Restablecimiento de contraseña
   - Cambio de email
   - Magia link (opcional)

---

## 💾 Ejecutar Schema SQL

### Paso 1: Abrir SQL Editor
1. Ve a **SQL Editor** en el panel izquierdo
2. Haz clic en **"New query"**

### Paso 2: Ejecutar Schema Completo
1. Abre el archivo `supabase-schema-v2.sql`
2. Copia **TODO** el contenido
3. Pégalo en el editor SQL
4. Haz clic en **"Run"** (Ctrl+Enter)
5. Deberías ver: **"Success. No rows returned"**

### Paso 3: Verificar Tablas
1. Ve a **Table Editor**
2. Deberías ver estas 12 tablas:
   ```
   ✅ perfiles
   ✅ proyectos
   ✅ proyecto_organizadores
   ✅ event_registrations
   ✅ asistencias
   ✅ peticiones_proyectos
   ✅ donaciones
   ✅ metodos_pago
   ✅ solicitudes_organizador
   ✅ prestamos
   ✅ reportes_incidentes
   ✅ recomendaciones_mejora
   ```

### Paso 4: Verificar Trigger de Perfiles
El trigger `on_auth_user_created` crea automáticamente un perfil cuando un usuario se registra.

Para verificar:
1. Ve a **Database** → **Functions**
2. Busca `handle_new_user`
3. Debe estar listada

---

## 📁 Configurar Storage (Opcional pero Recomendado)

Para almacenar fotos de proyectos, documentos, etc.

### Paso 1: Crear Buckets
1. Ve a **Storage**
2. Haz clic en **"Create bucket"**
3. Crea estos buckets:
   ```
   Bucket Name: avatars
   Public: ✅ Yes
   
   Bucket Name: proyectos-fotos
   Public: ✅ Yes
   
   Bucket Name: documentos
   Public: ❌ No
   
   Bucket Name: incidentes
   Public: ❌ No
   ```

### Paso 2: Configurar Políticas de Storage
Para **avatars** (público):
```sql
-- Permitir lectura pública
CREATE POLICY "Avatares son públicos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Permitir que usuarios suban su avatar
CREATE POLICY "Usuarios pueden subir su avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Para **documentos** (privado):
```sql
-- Solo el dueño puede ver sus documentos
CREATE POLICY "Usuarios ven sus documentos"
ON storage.objects FOR SELECT
USING ( 
  bucket_id = 'documentos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 🔧 Variables de Entorno

### Paso 1: Obtener Credenciales
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: La clave pública

### Paso 2: Crear `.env.local`
En la raíz del proyecto:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-aqui
```

### Paso 3: Reiniciar Servidor
```bash
npm run dev
```

⚠️ **IMPORTANTE**: Asegúrate que `.env.local` esté en `.gitignore`

---

## 👨‍💼 Crear Usuario Admin

### Opción 1: Desde el Dashboard de Supabase

1. Ve a **Authentication** → **Users**
2. Haz clic en **"Add user"**
3. Completa:
   ```
   Email: admin@reforestacion.com
   Password: [una contraseña segura]
   Auto Confirm User: ✅ Yes
   ```
4. Haz clic en **"Create user"**
5. Copia el **User UID** que aparece
6. Ve a **SQL Editor** y ejecuta:
   ```sql
   UPDATE perfiles 
   SET role = 'admin'
   WHERE id = 'UUID-DEL-USUARIO-AQUI';
   ```

### Opción 2: Programáticamente (Recomendado)

Crea un script temporal `create-admin.js`:
```javascript
import { supabase } from './src/lib/supabase-v2.js';

async function createAdmin() {
  // 1. Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'admin@reforestacion.com',
    password: 'Admin123!Seguro',
    options: {
      data: {
        nombre: 'Administrador'
      }
    }
  });

  if (authError) {
    console.error('Error:', authError);
    return;
  }

  console.log('✅ Usuario creado:', authData.user.id);

  // 2. Actualizar perfil a admin
  const { error: updateError } = await supabase
    .from('perfiles')
    .update({ role: 'admin' })
    .eq('id', authData.user.id);

  if (updateError) {
    console.error('Error actualizando perfil:', updateError);
    return;
  }

  console.log('✅ Admin creado exitosamente!');
}

createAdmin();
```

Ejecuta:
```bash
node create-admin.js
```

---

## ✅ Probar la Configuración

### Test 1: Registro de Usuario
```javascript
import { signUp } from './src/lib/supabase-v2.js';

const result = await signUp({
  email: 'test@ejemplo.com',
  password: 'Test123!',
  nombre: 'Usuario Prueba',
  telefono: '0999999999',
  ciudad: 'Manta'
});

console.log(result);
// Debe crear usuario en auth.users Y perfil en perfiles
```

### Test 2: Login
```javascript
import { signIn } from './src/lib/supabase-v2.js';

const result = await signIn({
  email: 'test@ejemplo.com',
  password: 'Test123!'
});

console.log(result);
// Debe retornar datos del usuario
```

### Test 3: Obtener Usuario Actual
```javascript
import { getCurrentUser } from './src/lib/supabase-v2.js';

const user = await getCurrentUser();
console.log(user);
// Debe incluir datos de auth.users y perfiles
```

### Test 4: Crear Proyecto (como admin)
```javascript
import { createProyecto } from './src/lib/supabase-v2.js';

const proyecto = await createProyecto({
  nombre: 'Proyecto Prueba',
  ubicacion: 'Manta',
  descripcion: 'Proyecto de prueba',
  lat: -0.9537,
  lng: -80.7089,
  fecha: '2025-03-15',
  arboles: 1000,
  voluntarios_esperados: 50,
  especies: ['Ceibo', 'Guayacán'],
  estado: 'Próximo'
});

console.log(proyecto);
```

---

## 🐛 Solución de Problemas

### Error: "Invalid API key"
- Verifica las variables de entorno
- Reinicia el servidor de desarrollo
- Revisa que copiaste la clave completa

### Error: "new row violates row-level security policy"
Verifica las políticas RLS:
```sql
-- Ver políticas de una tabla
SELECT * FROM pg_policies WHERE tablename = 'perfiles';

-- Temporalmente deshabilitar RLS (SOLO PARA DEBUG)
ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;
```

### Error: "User already registered"
El trigger de perfiles puede estar duplicando:
```sql
-- Verificar triggers
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Los emails no llegan
Para desarrollo, revisa en:
1. **Authentication** → **Users** → (tu usuario) → Ver el link de confirmación
2. O deshabilita confirmación de email temporalmente

---

## 📊 Estructura de Datos

### Flujo de Registro:
```
1. Usuario llena formulario
   ↓
2. signUp() crea registro en auth.users
   ↓
3. Trigger automático crea perfil en 'perfiles'
   ↓
4. Frontend actualiza datos adicionales en 'perfiles'
   ↓
5. Usuario queda listo para usar la app
```

### Relaciones Importantes:
```
auth.users (Supabase Auth)
    ↓ (1:1)
perfiles (Datos extendidos)
    ↓ (1:N)
event_registrations, donaciones, peticiones, etc.
```

---

## 🎉 ¡Listo!

Tu proyecto ahora tiene:
- ✅ Autenticación completa con Supabase Auth
- ✅ 12 tablas con todas las funcionalidades
- ✅ Row Level Security configurado
- ✅ Triggers automáticos
- ✅ Funciones helper en supabase-v2.js
- ✅ Soporte para donaciones
- ✅ Sistema de préstamos
- ✅ Reportes de incidentes
- ✅ Recomendaciones de mejora
- ✅ Storage para archivos

## 📝 Próximos Pasos

1. Reemplaza `src/lib/supabase.js` por `src/lib/supabase-v2.js`
2. Actualiza los formularios para usar las nuevas funciones
3. Crea los nuevos componentes de formularios
4. Implementa las páginas para donaciones, préstamos, etc.

¿Necesitas ayuda con algún formulario específico? ¡Avísame!
