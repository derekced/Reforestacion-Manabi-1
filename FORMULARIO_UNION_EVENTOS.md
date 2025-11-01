# Formulario de Unión a Eventos de Reforestación

## 📋 Descripción

Se ha creado un formulario completo para que los usuarios puedan unirse a eventos de reforestación desde el mapa interactivo de proyectos. Este formulario recopila información detallada de los voluntarios y valida los datos antes de confirmar el registro.

## 🎯 Características Principales

### 1. **Acceso desde el Mapa**
- El botón "Unirse al proyecto" ahora abre un formulario modal
- Se verifica si el usuario está autenticado antes de mostrar el formulario
- Si no está autenticado, se redirige al login
- Se previenen registros duplicados

### 2. **Campos del Formulario**

#### Información Personal:
- ✅ **Nombre Completo*** (Requerido)
- ✅ **Correo Electrónico*** (Requerido, con validación de formato)
- ✅ **Teléfono*** (Requerido, validación de 10 dígitos)
- ✅ **Edad*** (Requerido, entre 16 y 100 años)

#### Información del Voluntariado:
- ✅ **Experiencia en Reforestación*** (Selector)
  - Ninguna - Es mi primera vez
  - Básica - He participado 1-2 veces
  - Intermedia - He participado 3-5 veces
  - Avanzada - Participo regularmente

- ✅ **Disponibilidad*** (Selector)
  - Día completo
  - Solo mañana
  - Solo tarde

- ✅ **Transporte*** (Selector)
  - Tengo transporte propio
  - Usaré transporte público
  - Necesito transporte compartido
  - Necesito que me recojan

- ✅ **Comentarios o Preguntas** (Opcional)
  - Campo de texto libre para consultas adicionales

### 3. **Validaciones Implementadas**

```javascript
✓ Nombre: No puede estar vacío
✓ Email: Formato válido (usuario@dominio.com)
✓ Teléfono: Exactamente 10 dígitos numéricos
✓ Edad: Número entre 16 y 100
✓ Verificación de registro duplicado
```

### 4. **Experiencia de Usuario**

- **Modal Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Modo Oscuro**: Soporte completo para tema oscuro
- **Feedback Visual**: 
  - Errores mostrados en tiempo real
  - Indicador de carga durante el envío
  - Mensaje de éxito con auto-cierre
- **Información del Evento**: Muestra fecha y número de árboles del proyecto
- **Nota Informativa**: Indica que recibirán confirmación por correo

## 📁 Archivos Modificados/Creados

### Nuevo Componente:
```
src/components/proyectos/FormularioUnirseEvento.jsx
```
**Funcionalidad**: Formulario modal completo con validación de datos

### Archivos Modificados:
```
src/components/proyectos/MapaProyectos.jsx
```
**Cambios**:
- Importación del nuevo componente FormularioUnirseEvento
- Gestión de estado para el modal (showFormulario, eventoSeleccionado)
- Modificación del componente JoinButton para abrir el formulario
- Verificación de autenticación y registros duplicados

## 🔄 Flujo de Registro

```
1. Usuario hace clic en "Unirse al proyecto" en el popup del mapa
   ↓
2. Sistema verifica si está autenticado
   - Si NO → Redirige a /login
   - Si SÍ → Continúa al paso 3
   ↓
3. Sistema verifica si ya está registrado en ese evento
   - Si YA ESTÁ → Muestra alerta
   - Si NO → Abre el formulario
   ↓
4. Usuario completa el formulario
   ↓
5. Sistema valida todos los campos
   - Si HAY ERRORES → Muestra mensajes de error
   - Si TODO OK → Continúa al paso 6
   ↓
6. Sistema guarda el registro en localStorage
   ↓
7. Dispara eventos para actualizar otras vistas
   ↓
8. Muestra mensaje de éxito
   ↓
9. Cierra el formulario automáticamente después de 2 segundos
```

## 💾 Estructura de Datos Guardados

```javascript
{
  id: "evento-1-user@email.com-1234567890",
  evento: {
    id: "1",
    nombre: "Reforestación Parque Nacional Machalilla",
    fecha: "2025-02-15",
    ubicacion: "Puerto López",
    lat: -1.5514,
    lng: -80.8186,
    estado: "Próximo"
  },
  userEmail: "usuario@ejemplo.com",
  userName: "Juan Pérez",
  telefono: "0987654321",
  edad: 25,
  experiencia: "basica",
  disponibilidad: "completo",
  transporte: "propio",
  comentarios: "¿Debo llevar herramientas?",
  estado: "confirmado",
  fechaRegistro: "2025-11-01T10:30:00.000Z"
}
```

## 🎨 Diseño Visual

### Colores:
- **Header**: Degradado verde (green-600 → green-700)
- **Botón Principal**: Verde (green-600) con hover
- **Errores**: Rojo (red-500/red-600)
- **Éxito**: Verde (green-50 con borde green-200)
- **Información**: Azul (blue-50 con borde blue-200)

### Características Visuales:
- Bordes redondeados (rounded-lg, rounded-xl)
- Sombras sutiles (shadow-2xl)
- Fondo con blur (backdrop-blur-sm)
- Transiciones suaves en hover
- Indicador de carga animado

## 🔔 Eventos Disparados

El formulario dispara estos eventos para mantener sincronizadas otras partes de la aplicación:

```javascript
1. 'registrationChange' → Actualiza la vista de "Mis Proyectos"
2. 'storage' → Notifica cambios en localStorage
3. 'app:toast' (CustomEvent) → Muestra notificación toast (si está implementado)
```

## 🚀 Uso

### Para Usuarios:
1. Navegar a la página de Proyectos
2. Explorar el mapa de eventos
3. Hacer clic en un marcador del mapa
4. En el popup, hacer clic en "Unirse al proyecto"
5. Completar el formulario
6. Hacer clic en "Confirmar Registro"

### Para Desarrolladores:
```jsx
import FormularioUnirseEvento from '@/components/proyectos/FormularioUnirseEvento';

// Uso básico
<FormularioUnirseEvento
  evento={eventoSeleccionado}
  isOpen={showFormulario}
  onClose={() => setShowFormulario(false)}
/>
```

## 📱 Responsive

El formulario está completamente optimizado para dispositivos móviles:
- Ancho máximo de 2xl en desktop
- Altura máxima del 90% de la ventana
- Scroll interno cuando el contenido es muy largo
- Grid responsive para campos de teléfono/edad

## ✨ Mejoras Futuras Sugeridas

1. **Integración con Backend**
   - Enviar datos a una API real
   - Confirmación por email automática
   
2. **Validación Mejorada**
   - Verificar formato de teléfono específico del país
   - Validar disponibilidad de cupos en el evento
   
3. **Funcionalidades Adicionales**
   - Subir foto de perfil
   - Selección de tallas de camiseta
   - Preferencias alimenticias
   - Contacto de emergencia
   
4. **Integraciones**
   - Integración con Google Calendar
   - Recordatorios por SMS/WhatsApp
   - Compartir en redes sociales

## 🐛 Manejo de Errores

El formulario maneja varios casos de error:
- ✅ Usuario no autenticado → Redirige a login
- ✅ Registro duplicado → Muestra alerta
- ✅ Campos vacíos → Muestra errores en tiempo real
- ✅ Formato inválido → Validación específica por campo
- ✅ Error al guardar → Mensaje de error general

## 🔐 Seguridad

- Validación en el cliente antes de guardar
- Verificación de autenticación
- Prevención de registros duplicados
- Sanitización de entrada de datos (especialmente en comentarios)

---

**Desarrollado con**: React, Next.js, Tailwind CSS, Lucide Icons
**Última actualización**: Noviembre 2025
