# 🔐 Registro de Administrador

## Cómo crear una cuenta de administrador

Para registrar un usuario con permisos de administrador completos:

### 1. Ve a la página de registro de administrador
```
http://localhost:3000/register/admin
```

### 2. Ingresa el código secreto de administrador
```
ADMIN2025MANABI
```

### 3. Completa el formulario
- Nombre completo
- Email
- Contraseña (mínimo 6 caracteres)
- Confirmar contraseña
- Teléfono (opcional)
- Ciudad
- Acepta los términos y condiciones

### 4. Haz clic en "Crear cuenta de administrador"

El usuario será creado automáticamente con rol de **administrador** y tendrá acceso a:

- ✅ Panel de administración completo (`/admin`)
- ✅ Gestión de proyectos (crear, editar, eliminar)
- ✅ Ver todas las estadísticas del sistema
- ✅ Gestión de usuarios
- ✅ Aprobación de peticiones de proyectos
- ✅ Todas las funcionalidades de usuario normal

---

## Seguridad

⚠️ **IMPORTANTE:**
- Este código debe mantenerse **secreto**
- Solo compártelo con personas de confianza
- Cambia el código en producción editando el archivo:
  - `src/components/formu/RegisterForm.js`
  - Línea: `if (form.adminCode === 'ADMIN2025MANABI')`
  - Cambia `'ADMIN2025MANABI'` por tu propio código

---

## Ejemplo de uso

1. **Usuario normal (sin código)**
   - Registro normal → Rol: `volunteer`
   - Sin acceso al panel admin

2. **Organizador**
   - Selecciona "Organizador" en el formulario
   - Rol: `organizer`
   - Puede crear proyectos (previa aprobación admin)

3. **Administrador (con código secreto)**
   - Registro normal + código `ADMIN2025MANABI`
   - Rol: `admin`
   - Acceso completo al sistema

---

## Diferencias de permisos

| Funcionalidad | Voluntario | Organizador | Admin |
|---------------|-----------|-------------|-------|
| Ver proyectos | ✅ | ✅ | ✅ |
| Registrarse en eventos | ✅ | ✅ | ✅ |
| Ver estadísticas personales | ✅ | ✅ | ✅ |
| Solicitar proyectos | ✅ | ✅ | ✅ |
| Crear proyectos | ❌ | ⚠️ (previa aprobación) | ✅ |
| Editar cualquier proyecto | ❌ | ❌ | ✅ |
| Eliminar proyectos | ❌ | ❌ | ✅ |
| Panel de administración | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Aprobar solicitudes | ❌ | ❌ | ✅ |

---

## Cambiar el código en producción

Para cambiar el código secreto, edita:

**Archivo:** `src/app/register/admin/page.js`

```javascript
// Busca esta línea (aproximadamente línea 73):
if (form.adminCode !== 'ADMIN2025MANABI') {
  setError('❌ Código de administrador incorrecto');
  return;
}

// Cámbiala por tu código personalizado:
if (form.adminCode !== 'TU_CODIGO_SECRETO_AQUI') {
  setError('❌ Código de administrador incorrecto');
  return;
}
```

**Recomendaciones para el código:**
- Mínimo 12 caracteres
- Mezcla de mayúsculas, minúsculas y números
- Ejemplo: `Verde2025$Manabi#Admin`

---

## Testing

Puedes probar el sistema con estas credenciales de prueba:

**Admin de prueba:**
- Email: `admin@test.com`
- Contraseña: `admin123`
- Código usado: `ADMIN2025MANABI`

(Nota: Debes crear esta cuenta primero usando el código)
