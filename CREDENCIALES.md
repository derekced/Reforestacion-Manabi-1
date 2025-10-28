# Credenciales de Acceso - Reforestación Manabí

## 🔐 Administrador

Para acceder al panel de administración (`/admin`):

**Email:** `admin@reforestacion.com`  
**Contraseña:** `admin123`

### Permisos del Administrador:
- ✅ Acceso al panel de administración
- ✅ Crear nuevos proyectos de reforestación
- ✅ Editar proyectos existentes
- ✅ Eliminar proyectos
- ✅ Gestionar toda la información en el mapa de Manabí
- ✅ Acceso a todas las funcionalidades de usuario normal

---

## 👤 Usuario Normal

Cualquier otro email y contraseña funcionará para un usuario normal.

**Ejemplo:**
- Email: `usuario@ejemplo.com`
- Contraseña: `cualquiercontraseña`

### Permisos del Usuario Normal:
- ✅ Ver proyectos en el mapa
- ✅ Registrarse en eventos de reforestación
- ✅ Ver estadísticas personales
- ✅ Gestionar su perfil
- ❌ **NO** tiene acceso al panel de administración

---

## 🎯 Diferencias Clave

| Funcionalidad | Usuario Normal | Administrador |
|--------------|----------------|---------------|
| Ver proyectos | ✅ | ✅ |
| Registrarse en eventos | ✅ | ✅ |
| Ver estadísticas | ✅ | ✅ |
| **Panel Admin en sidebar** | ❌ | ✅ |
| **Crear proyectos** | ❌ | ✅ |
| **Editar proyectos** | ❌ | ✅ |
| **Eliminar proyectos** | ❌ | ✅ |

---

## 📝 Notas Importantes

1. Los usuarios normales verán en el sidebar: **Inicio, Proyectos, Estadísticas, Perfil**
2. Los administradores verán adicionalmente: **Admin**
3. Si un usuario normal intenta acceder a `/admin` directamente, será redirigido a la página de inicio
4. La sesión se guarda en `localStorage` si se marca "Recordarme", o en `sessionStorage` si no

---

## 🔄 Para Cambiar las Credenciales

Las credenciales se encuentran en:
`src/components/formu/LoginForm.js` (líneas 53-56)

```javascript
const adminCredentials = {
  email: "admin@reforestacion.com",
  password: "admin123"
};
```
