# 🌳 Guía de Configuración de Supabase - Reforestación Manabí

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Crear Cuenta en Supabase](#crear-cuenta-en-supabase)
3. [Configurar Base de Datos](#configurar-base-de-datos)
4. [Configurar Autenticación](#configurar-autenticación)
5. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
6. [Probar la Conexión](#probar-la-conexión)
7. [Migración de Datos desde localStorage](#migración-de-datos)

---

## 📌 Requisitos Previos

- Node.js instalado (v18 o superior)
- Cuenta de correo electrónico
- Navegador web actualizado

---

## 🚀 Crear Cuenta en Supabase

### Paso 1: Registrarse
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Regístrate con:
   - GitHub (Recomendado)
   - Google
   - Correo electrónico

### Paso 2: Crear Nuevo Proyecto
1. Haz clic en **"New Project"**
2. Completa los campos:
   ```
   Name: reforestacion-manabi
   Database Password: [Genera una contraseña segura y guárdala]
   Region: South America (São Paulo) - Más cercano a Ecuador
   Pricing Plan: Free (suficiente para comenzar)
   ```
3. Haz clic en **"Create new project"**
4. Espera 2-3 minutos mientras se crea el proyecto

---

## 🗄️ Configurar Base de Datos

### Paso 1: Acceder al Editor SQL
1. En el panel izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"**

### Paso 2: Ejecutar el Schema
1. Abre el archivo `supabase-schema.sql` de tu proyecto
2. Copia **TODO** el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **"Run"** (esquina inferior derecha)
5. Verás el mensaje: **"Success. No rows returned"**

### Paso 3: Verificar Tablas Creadas
1. En el panel izquierdo, haz clic en **"Table Editor"**
2. Deberías ver las siguientes tablas:
   - ✅ usuarios
   - ✅ proyectos
   - ✅ proyecto_organizadores
   - ✅ event_registrations
   - ✅ asistencias
   - ✅ peticiones_proyectos

---

## 🔐 Configurar Autenticación

### Paso 1: Habilitar Email Auth
1. Ve a **"Authentication"** → **"Providers"**
2. Asegúrate que **"Email"** esté habilitado (debería estarlo por defecto)
3. Configuración recomendada:
   ```
   ☑ Enable email provider
   ☑ Confirm email (deshabilitado para desarrollo)
   ☑ Secure email change (habilitado)
   ```

### Paso 2: Configurar URL de Redirección (Opcional)
1. Ve a **"Authentication"** → **"URL Configuration"**
2. En **"Site URL"** añade:
   ```
   http://localhost:3000  (para desarrollo)
   ```
3. En **"Redirect URLs"** añade:
   ```
   http://localhost:3000/**
   ```

### Paso 3: Crear Usuario Administrador
1. Ve a **"SQL Editor"** → **"New query"**
2. Ejecuta este script (reemplaza el email y contraseña):
   ```sql
   -- Primero crea el usuario en Auth
   -- Ve a Authentication → Users → "Add user"
   -- Email: admin@reforestacion.com
   -- Password: admin123 (o la que prefieras)
   -- Después de crear el usuario, ejecuta:
   
   -- Obtén el UUID del usuario recién creado
   SELECT id FROM auth.users WHERE email = 'admin@reforestacion.com';
   
   -- Usa ese UUID en el siguiente INSERT (reemplaza 'UUID-AQUI')
   INSERT INTO usuarios (id, email, nombre, role)
   VALUES ('UUID-AQUI', 'admin@reforestacion.com', 'Administrador', 'admin');
   ```

---

## 🔧 Configurar Variables de Entorno

### Paso 1: Obtener Credenciales
1. Ve a **"Settings"** (ícono de engranaje) → **"API"**
2. Encontrarás:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` - Esta es tu **ANON KEY**

### Paso 2: Crear Archivo .env.local
1. En la raíz de tu proyecto, crea un archivo llamado `.env.local`
2. Copia el contenido de `.env.local.example`
3. Reemplaza con tus valores reales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-real-aqui
   ```

### Paso 3: Añadir .env.local al .gitignore
Asegúrate que tu `.gitignore` contenga:
```
.env.local
.env*.local
```

⚠️ **IMPORTANTE**: NUNCA subas `.env.local` a GitHub

---

## ✅ Probar la Conexión

### Paso 1: Reiniciar el Servidor de Desarrollo
```bash
# Detén el servidor si está corriendo (Ctrl+C)
# Luego reinicia:
npm run dev
```

### Paso 2: Probar Login
1. Ve a `http://localhost:3000/login`
2. Intenta iniciar sesión con el usuario admin que creaste
3. Si todo está bien, deberías poder iniciar sesión correctamente

### Paso 3: Verificar en Dashboard de Supabase
1. Ve a **"Authentication"** → **"Users"**
2. Deberías ver el usuario que acabas de crear

---

## 📦 Migración de Datos desde localStorage

Si tienes datos de prueba en localStorage que quieres migrar:

### Opción 1: Script de Migración Automático (Próximamente)
Crearemos un script que migre automáticamente los datos.

### Opción 2: Migración Manual
1. Ve a **"SQL Editor"**
2. Usa `INSERT` statements para añadir tus proyectos existentes:

```sql
-- Ejemplo: Insertar un proyecto
INSERT INTO proyectos (nombre, ubicacion, descripcion, lat, lng, fecha, arboles, voluntarios_esperados, especies, estado)
VALUES (
  'Reforestación Parque Nacional Machalilla',
  'Puerto López',
  'Recuperación de bosque seco tropical',
  -1.5514,
  -80.8186,
  '2025-02-15',
  2500,
  150,
  ARRAY['Guayacán', 'Ceibo', 'Fernán Sánchez'],
  'Próximo'
);
```

---

## 🎯 Próximos Pasos

Una vez configurado todo:

1. ✅ Los formularios ahora guardarán en Supabase en lugar de localStorage
2. ✅ Los datos persistirán entre sesiones y dispositivos
3. ✅ Las políticas de seguridad (RLS) protegerán los datos
4. ✅ Podrás acceder a estadísticas en tiempo real

---

## 🐛 Solución de Problemas Comunes

### Error: "Invalid API key"
- Verifica que copiaste correctamente la `anon key`
- Asegúrate de reiniciar el servidor después de crear `.env.local`

### Error: "Row Level Security policy violation"
- Ve a **"Authentication"** y verifica que el usuario está autenticado
- Revisa las políticas RLS en **"Table Editor"** → [Tabla] → **"Policies"**

### Error: "Function does not exist"
- Asegúrate de ejecutar **TODO** el archivo `supabase-schema.sql`
- Verifica en **"Database"** → **"Functions"** que las funciones existen

### Los datos no se guardan
- Abre la consola del navegador (F12) y busca errores
- Verifica que las tablas tienen las políticas RLS correctas
- Intenta deshabilitar temporalmente RLS para debug:
  ```sql
  ALTER TABLE [nombre_tabla] DISABLE ROW LEVEL SECURITY;
  ```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la [Documentación de Supabase](https://supabase.com/docs)
2. Busca en [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
3. Revisa los logs en **"Logs"** del dashboard de Supabase

---

## 🎉 ¡Listo!

Tu proyecto ahora está configurado para usar Supabase. Los formularios guardarán automáticamente en la base de datos en la nube.
