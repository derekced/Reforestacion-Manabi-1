# 📋 Sistema de Registro de Asistencias

## Descripción General

El sistema de registro de asistencias permite a los usuarios registrar su participación real en los proyectos de reforestación e indicar cuántos árboles plantaron personalmente.

## 🎯 Características Principales

### 1. **Registro de Asistencia**
- Los usuarios pueden registrar su asistencia a proyectos en los que están inscritos
- Deben ingresar la cantidad de árboles que plantaron personalmente
- Pueden actualizar la cantidad si ya registraron su asistencia previamente

### 2. **Visualización en Perfil de Usuario**
- Badge verde con checkmark cuando ya registraron asistencia
- Muestra la cantidad de árboles plantados
- Botón "Registrar Asistencia" para nuevos registros
- Botón "Actualizar" para modificar registros existentes

### 3. **Widget de Impacto**
- Muestra el **total de árboles realmente plantados** por el usuario
- Se actualiza automáticamente cuando se registra una asistencia
- Barra de progreso hacia la meta semanal
- Indicador visual del impacto personal

### 4. **Panel de Administrador - Estadísticas**
- Lista completa de usuarios que asistieron a cada proyecto
- Cantidad de árboles plantados por cada usuario
- Progreso total del proyecto basado en asistencias reales
- Tasa de participación (participantes reales vs esperados)

## 📊 Estructura de Datos

### Formato de Asistencia en LocalStorage

```javascript
{
  projectId: "id_del_proyecto",      // ID del proyecto
  userEmail: "email@usuario.com",    // Email del usuario
  userName: "Nombre Usuario",        // Nombre del usuario
  arbolesPlantados: 50,              // Cantidad de árboles plantados
  fechaRegistro: "2025-10-28T..."   // Fecha y hora del registro
}
```

### Almacenamiento

**Clave:** `asistencias`  
**Formato:** Array de objetos JSON  
**Ubicación:** `localStorage`

## 🔄 Flujo de Uso

### Para Usuarios Normales:

1. **Inscribirse en un proyecto** (desde el mapa de proyectos)
2. **Asistir al evento** físicamente
3. **Ir a Mi Perfil**
4. **Hacer clic en "Registrar Asistencia"**
5. **Ingresar cantidad de árboles plantados**
6. **Confirmar**
7. El widget de impacto se actualiza automáticamente

### Para Administradores:

1. **Ir al Panel de Administración**
2. **Hacer clic en "Ver Estadísticas"** en cualquier proyecto
3. Ver la lista de usuarios que asistieron
4. Ver el progreso real del proyecto
5. Ver métricas de participación

## 📈 Métricas Calculadas

### Progreso de Plantación
```javascript
progreso = (arbolesPlantados / arbolesObjetivo) * 100
```

### Tasa de Participación
```javascript
tasaParticipacion = (usuariosQueAsistieron / voluntariosEsperados) * 100
```

### Impacto Personal
```javascript
impactoPersonal = Σ(arbolesPlantados por usuario)
```

## 🎨 Indicadores Visuales

### Estados de Asistencia:
- **Sin registrar**: Botón verde "Registrar Asistencia"
- **Ya registrada**: Badge verde + Botón azul "Actualizar"

### Colores de Progreso:
- **Verde**: Progreso de plantación
- **Azul**: Participación de voluntarios
- **Naranja**: Árboles restantes

## 🔔 Eventos del Sistema

El sistema utiliza eventos personalizados para sincronización en tiempo real:

- `asistenciaChange`: Se dispara al registrar/actualizar asistencia
- `storage`: Se dispara para actualizar el panel de admin
- `registrationChange`: Se dispara al cambiar registros de eventos

## 💡 Casos de Uso

### Caso 1: Usuario registra primera asistencia
```
Usuario inscrito → Asiste al evento → Registra asistencia → Widget actualizado
```

### Caso 2: Usuario actualiza cantidad de árboles
```
Asistencia existente → Clic en "Actualizar" → Nueva cantidad → Widget actualizado
```

### Caso 3: Admin revisa progreso
```
Admin → Panel → Estadísticas → Ve lista de asistentes → Ve progreso real
```

## 🛡️ Validaciones

1. ✅ Solo se puede registrar asistencia en proyectos inscritos
2. ✅ La cantidad de árboles debe ser mayor a 0
3. ✅ Se puede actualizar la asistencia múltiples veces
4. ✅ Los datos se sincronizan automáticamente entre componentes

## 🚀 Beneficios del Sistema

- 📊 **Datos reales** de impacto ambiental
- 👥 **Reconocimiento** a usuarios participantes
- 📈 **Métricas precisas** para administradores
- 🎯 **Motivación** con metas personales
- 🌳 **Transparencia** en resultados de proyectos

---

**Nota**: El sistema está diseñado para escalar y puede integrarse fácilmente con una base de datos real en el futuro.
