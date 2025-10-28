"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  es: {
    // Sidebar
    sidebar: {
      inicio: "Inicio",
      proyectos: "Proyectos",
      estadisticas: "Estadísticas",
      acceso: "Acceso",
      registro: "Registro",
      tuImpacto: "Tu impacto",
      arboles: "árboles",
      faltan: "Faltan",
      arbolesParaMeta: "árboles para tu meta semanal",
      modoOscuro: "Modo oscuro",
      modoClaro: "Modo claro",
      espanol: "Español",
      ingles: "English",
      acceder: "Acceder",
    },
    
    // Menú de usuario
    userMenu: {
      notificaciones: "Notificaciones",
      cerrarSesion: "Cerrar Sesión",
    },
    
    // Página de inicio
    home: {
      badge: "Iniciativa Ambiental 2025",
      titulo1: "Renovemos el",
      titulo2: "Verde de Manabí",
      descripcion1: "Únete a nuestra misión de reforestar",
      hectareas: "10,000 hectáreas",
      descripcion2: "en Manabí. Cada árbol plantado es un paso hacia un futuro más verde y sostenible.",
      arbolesPlantados: "Árboles Plantados",
      hectareasLabel: "Hectáreas",
      voluntarios: "Voluntarios",
      plantarArbol: "Plantar un Árbol",
      verProyecto: "Ver el Proyecto",
      verProyectos: "Ver Proyectos",
      verEstadisticas: "Ver Estadísticas",
      personas: "+892 personas",
      seUnieron: "ya se unieron esta semana",
      arbolesNativos: "Árboles Nativos",
      especies: "23 Especies",
      co2Capturado: "CO₂ Capturado",
      toneladas: "1,245 Tons",
    },
    
    // Página de proyectos
    proyectos: {
      titulo: "Proyectos de Reforestación",
      descripcion: "Descubre y únete a nuestras iniciativas de reforestación en toda la provincia de Manabí",
      totalDe: "Total de",
      proyectos: "Proyectos",
      arboles: "Árboles",
      plantados: "Plantados",
      voluntarios: "Voluntarios",
      mapaInteractivo: "Mapa Interactivo de Proyectos",
      hacClicMarcadores: "Haz clic en los marcadores para ver información detallada de cada proyecto",
      cargandoMapa: "Cargando mapa...",
      cargando: "Cargando...",
    },
    
    // Estadísticas
    estadisticas: {
      titulo: "Mis Estadísticas",
      descripcion: "Monitorea tu progreso y contribución al medio ambiente",
      tuImpacto: "TU IMPACTO",
      arboles: "árboles",
      faltan: "Faltan",
      paraMeta: "para tu meta semanal",
      metaCumplida: "¡Meta cumplida! 🎉",
      deTuMeta: "de tu meta",
      metaSemanal: "Meta Semanal",
      arbolesPorSemana: "árboles por semana",
      editar: "Editar",
      estableceMeta: "Establece tu meta semanal",
      placeholderMeta: "Ej: 200",
      guardar: "Guardar",
      cancelar: "Cancelar",
      proyectosRegistrados: "Proyectos Registrados",
      proyectosActivos: "Proyectos Activos",
      proyectosProximos: "Proyectos Próximos",
      progresoMeta: "Progreso de Meta",
      desgloseContribucion: "Desglose de Contribución",
      arbolesEstimados: "árboles estimados",
      empiezaAventura: "¡Empieza tu Aventura Verde!",
      registrateProyectos: "Regístrate en proyectos de reforestación para ver tus estadísticas",
      explorarProyectos: "Explorar Proyectos",
    },
    
    // Perfil
    perfil: {
      titulo: "Mi Perfil",
      descripcion: "Administra tu información y proyectos de reforestación",
      misProyectos: "Mis Proyectos",
      noHayProyectos: "No hay proyectos registrados",
      noRegistrado: "Aún no te has registrado en ningún evento de reforestación",
      fecha: "Fecha",
      arboles: "Árboles",
      voluntarios: "Voluntarios",
      ubicacion: "Ubicación",
      especies: "Especies",
      registradoEl: "Registrado el",
      cancelarRegistro: "Cancelar Registro",
      verEstadisticas: "Ver Estadísticas Completas",
    },

    // Mapa de Proyectos
    mapaProyectos: {
      filtrarEstado: "Filtrar por estado:",
      todos: "Todos",
      proximo: "Próximo",
      activo: "Activo",
      finalizado: "Finalizado",
      fecha: "Fecha:",
      arboles: "Árboles:",
      voluntarios: "Voluntarios:",
      especies: "Especies:",
    },
    
    // Modal de registro
    modal: {
      seleccionaProyecto: "Selecciona un Proyecto",
      registroProyecto: "Registro al Proyecto",
      registrarse: "Registrarse",
      nombreCompleto: "Nombre Completo",
      email: "Email",
      telefono: "Teléfono",
      edad: "Edad",
      experiencia: "Experiencia en Reforestación",
      ninguna: "Ninguna",
      principiante: "Principiante (1-2 eventos)",
      intermedio: "Intermedio (3-5 eventos)",
      avanzado: "Avanzado (más de 5 eventos)",
      comentarios: "Comentarios o Preguntas",
      volver: "Volver",
      confirmarRegistro: "Confirmar Registro",
      registrando: "Registrando...",
      registroExitoso: "¡Registro Exitoso!",
      mensajeExito: "Te has registrado exitosamente al proyecto. Revisa tu perfil para más detalles.",
      cancelarRegistroTitulo: "¿Cancelar Registro?",
      cancelarRegistroMsg: "¿Estás seguro de que quieres cancelar tu registro al proyecto",
      noMantener: "No, Mantener",
      siCancelar: "Sí, Cancelar",
    },
    
    // Estados de proyectos
    estados: {
      activo: "Activo",
      proximo: "Próximo",
      completado: "Completado",
    },
    
    // Meses
    meses: {
      enero: "Enero",
      febrero: "Febrero",
      marzo: "Marzo",
      abril: "Abril",
      mayo: "Mayo",
      junio: "Junio",
      julio: "Julio",
      agosto: "Agosto",
      septiembre: "Septiembre",
      octubre: "Octubre",
      noviembre: "Noviembre",
      diciembre: "Diciembre",
    },
    
    // Login
    login: {
      titulo: "Bienvenido de Nuevo",
      subtitulo: "Ingresa a tu cuenta para continuar tu misión verde",
      email: "Correo Electrónico",
      contrasena: "Contraseña",
      recordarme: "Recordarme",
      olvidarContrasena: "¿Olvidaste tu contraseña?",
      iniciarSesion: "Iniciar Sesión",
      iniciando: "Iniciando...",
      noTienesCuenta: "¿No tienes una cuenta?",
      registrate: "Regístrate aquí",
      emailRequerido: "El correo electrónico es requerido",
      contrasenaRequerida: "La contraseña es requerida",
      credencialesInvalidas: "Credenciales inválidas",
    },
    
    // Registro
    register: {
      titulo: "Únete a la Comunidad",
      subtitulo: "Crea tu cuenta y comienza a plantar árboles",
      nombreCompleto: "Nombre Completo",
      email: "Correo Electrónico",
      contrasena: "Contraseña",
      confirmarContrasena: "Confirmar Contraseña",
      telefono: "Teléfono (opcional)",
      ciudad: "Ciudad",
      aceptoTerminos: "Acepto los términos y condiciones",
      crearCuenta: "Crear Cuenta",
      creando: "Creando cuenta...",
      yaTienesCuenta: "¿Ya tienes una cuenta?",
      iniciarSesion: "Inicia sesión",
      nombreRequerido: "El nombre completo es requerido",
      emailRequerido: "El correo electrónico es requerido",
      contrasenaRequerida: "La contraseña es requerida",
      contrasenasNoCoinciden: "Las contraseñas no coinciden",
      ciudadRequerida: "La ciudad es requerida",
      aceptarTerminos: "Debes aceptar los términos y condiciones",
      registroExitoso: "¡Cuenta creada exitosamente!",
      emailYaRegistrado: "Este correo ya está registrado",
    },
    
    // Recuperar contraseña
    recuperar: {
      titulo: "Recuperar Contraseña",
      subtitulo: "Ingresa tu correo electrónico y te enviaremos instrucciones",
      email: "Correo Electrónico",
      enviarInstrucciones: "Enviar Instrucciones",
      enviando: "Enviando...",
      volverLogin: "Volver al inicio de sesión",
      exitoTitulo: "¡Revisa tu Correo!",
      exitoMensaje: "Hemos enviado instrucciones para recuperar tu contraseña. Por favor revisa tu bandeja de entrada.",
      emailRequerido: "El correo electrónico es requerido",
    },

    // Mis Proyectos (Perfil)
    misProyectos: {
      titulo: "Mis Proyectos",
      noProyectos: "No hay proyectos registrados",
      noProyectosDesc: "Aún no te has registrado en ningún evento de reforestación",
      explorarProyectos: "Explorar Proyectos",
      registradoEl: "Registrado el",
      cancelarRegistro: "Cancelar Registro",
      registrarAsistencia: "Registrar Asistencia",
      actualizar: "Actualizar",
      asistenciaRegistrada: "Asistencia Registrada",
      hasPlantado: "Has plantado",
      arboles: "árboles",
      fecha: "Fecha",
      voluntarios: "Voluntarios",
      ubicacion: "Ubicación",
      especies: "Especies",
      
      // Modal de cancelación
      cancelarTitulo: "¿Cancelar Registro?",
      cancelarMensaje: "¿Estás seguro de que quieres cancelar tu registro al proyecto",
      noMantener: "No, Mantener",
      siCancelar: "Sí, Cancelar",
      
      // Modal de asistencia
      registrarAsistenciaTitulo: "Registrar Asistencia",
      ingresaCantidad: "Ingresa la cantidad de árboles que plantaste en este proyecto",
      arbolesPlantados: "Árboles Plantados",
      placeholderArboles: "Ej: 50",
      limiteProyecto: "Límite del proyecto",
      soloTuyos: "💡 Ingresa solo los árboles que tú plantaste personalmente",
      tuContribucion: "¡Tu contribución es valiosa!",
      ayudaraRastrear: "Esta información ayudará a rastrear el impacto real del proyecto",
      cancelar: "Cancelar",
      confirmar: "Confirmar",
      cantidadInvalida: "Por favor, ingresa una cantidad válida de árboles plantados",
      excedeLimite: "La cantidad no puede superar el límite del proyecto ({max} árboles)",
      asistenciaExito: "¡Asistencia registrada exitosamente! 🌳",
      errorRegistrar: "Error al registrar la asistencia",
    },

    // Widget de Impacto
    widgetImpacto: {
      tuImpacto: "TU IMPACTO",
      arboles: "árboles",
      plantados: "plantados",
      faltan: "Faltan",
      arbolesParaMeta: "árboles para tu meta semanal.",
      paraMeta: "para tu meta semanal",
      metaCumplida: "¡Meta cumplida!",
      metaSemanal: "Meta Semanal",
      progreso: "Progreso",
      verEstadisticas: "Ver Estadísticas Completas",
    },

    // Widget de Admin
    widgetAdmin: {
      panel: "PANEL ADMIN",
      proyectos: "proyectos",
      activos: "activos",
      voluntarios: "voluntarios",
    },

    // Panel de Administración
    admin: {
      titulo: "Panel de Administración",
      subtitulo: "Gestiona los proyectos de reforestación en Manabí",
      nuevoProyecto: "Nuevo Proyecto",
      noHayProyectos: "No hay proyectos",
      noHayProyectosDesc: "Comienza agregando tu primer proyecto de reforestación",
      agregarProyecto: "Agregar Proyecto",
      
      // Formulario
      editarProyecto: "Editar Proyecto",
      nombreProyecto: "Nombre del Proyecto",
      nombreProyectoPlaceholder: "Ej: Reforestación Parque Nacional Machalilla",
      ubicacion: "Ubicación (Ciudad/Cantón de Manabí)",
      seleccionaUbicacion: "Selecciona una ubicación",
      otraUbicacion: "Otra ubicación (personalizada)",
      escribeUbicacion: "Escribe la ubicación",
      coordenadas: "Coordenadas",
      coordenadasAyuda: "Las coordenadas se completan automáticamente al seleccionar una ubicación",
      coordenadasPersonalizadas: "Si necesitas coordenadas personalizadas, puedes usar",
      googleMaps: "Google Maps",
      googleMapsInfo: "(clic derecho → \"¿Qué hay aquí?\")",
      latitud: "Latitud",
      longitud: "Longitud",
      numeroArboles: "Número de Árboles",
      voluntariosNecesarios: "Voluntarios Necesarios",
      especies: "Especies (separadas por comas)",
      especiesPlaceholder: "Guayacán, Ceibo, Fernán Sánchez",
      fechaEvento: "Fecha del Evento",
      estado: "Estado",
      proximo: "Próximo",
      activo: "Activo",
      completado: "Completado",
      descripcion: "Descripción",
      descripcionPlaceholder: "Describe el proyecto de reforestación...",
      guardarCambios: "Guardar Cambios",
      crearProyecto: "Crear Proyecto",
      cancelar: "Cancelar",
      confirmarEliminar: "¿Estás seguro de eliminar este proyecto?",
      
      // Estadísticas
      verEstadisticas: "Ver Estadísticas",
      estadisticasProyecto: "Estadísticas del Proyecto",
      estadoProyecto: "Estado del Proyecto",
      fecha: "Fecha",
      ubicacionLabel: "Ubicación",
      progresoPlantacion: "Progreso de Plantación",
      arbolesPlantadosDe: "de",
      arbolesPlantados: "árboles plantados",
      meta: "Meta",
      plantados: "Plantados",
      restantes: "Restantes",
      participacionVoluntarios: "Participación de Voluntarios",
      voluntariosDe: "de",
      esperados: "Esperados",
      participantes: "Participantes",
      usuariosRegistrados: "Usuarios Registrados que Asistieron",
      noHayAsistencias: "Aún no hay usuarios que hayan registrado su asistencia",
      podranRegistrar: "Los usuarios podrán registrar su asistencia desde su perfil",
      arbolesPlantadosLabel: "Árboles plantados",
      informacionProyecto: "Información del Proyecto",
      especiesLabel: "Especies",
      descripcionLabel: "Descripción",
      sinDescripcion: "Sin descripción",
      voluntariosEsperados: "voluntarios",
      arbolesLabel: "Árboles",
      voluntariosLabel: "Voluntarios",
      especiesLabelCard: "Especies",
      fechaLabel: "Fecha",
      coordenadas: "Coordenadas",
    },
  },
  
  en: {
    // Sidebar
    sidebar: {
      inicio: "Home",
      proyectos: "Projects",
      estadisticas: "Statistics",
      acceso: "Sign In",
      registro: "Sign Up",
      tuImpacto: "Your impact",
      arboles: "trees",
      faltan: "You need",
      arbolesParaMeta: "more trees to reach your weekly goal",
      modoOscuro: "Dark mode",
      modoClaro: "Light mode",
      espanol: "Español",
      ingles: "English",
      acceder: "Sign In",
    },
    
    // User menu
    userMenu: {
      notificaciones: "Notifications",
      cerrarSesion: "Sign Out",
    },
    
    // Home page
    home: {
      badge: "Environmental Initiative 2025",
      titulo1: "Let's Renew",
      titulo2: "Manabí's Green",
      descripcion1: "Join our mission to reforest",
      hectareas: "10,000 hectares",
      descripcion2: "in Manabí. Every tree planted is a step towards a greener and more sustainable future.",
      arbolesPlantados: "Trees Planted",
      hectareasLabel: "Hectares",
      voluntarios: "Volunteers",
      plantarArbol: "Plant a Tree",
      verProyecto: "Watch Project",
      verProyectos: "View Projects",
      verEstadisticas: "View Statistics",
      personas: "+892 people",
      seUnieron: "joined this week",
      arbolesNativos: "Native Trees",
      especies: "23 Species",
      co2Capturado: "CO₂ Captured",
      toneladas: "1,245 Tons",
    },
    
    // Projects page
    proyectos: {
      titulo: "Reforestation Projects",
      descripcion: "Discover and join our reforestation initiatives throughout the province of Manabí",
      totalDe: "Total",
      proyectos: "Projects",
      arboles: "Trees",
      plantados: "Planted",
      voluntarios: "Volunteers",
      mapaInteractivo: "Interactive Project Map",
      hacClicMarcadores: "Click on markers to see detailed information about each project",
      cargandoMapa: "Loading map...",
      cargando: "Loading...",
    },
    
    // Statistics
    estadisticas: {
      titulo: "My Statistics",
      descripcion: "Monitor your progress and environmental contribution",
      tuImpacto: "YOUR IMPACT",
      arboles: "trees",
      faltan: "You need",
      paraMeta: "for your weekly goal",
      metaCumplida: "Goal achieved! 🎉",
      deTuMeta: "of your goal",
      metaSemanal: "Weekly Goal",
      arbolesPorSemana: "trees per week",
      editar: "Edit",
      estableceMeta: "Set your weekly goal",
      placeholderMeta: "E.g: 200",
      guardar: "Save",
      cancelar: "Cancel",
      proyectosRegistrados: "Registered Projects",
      proyectosActivos: "Active Projects",
      proyectosProximos: "Upcoming Projects",
      progresoMeta: "Goal Progress",
      desgloseContribucion: "Contribution Breakdown",
      arbolesEstimados: "estimated trees",
      empiezaAventura: "Start Your Green Adventure!",
      registrateProyectos: "Register for reforestation projects to see your statistics",
      explorarProyectos: "Explore Projects",
    },
    
    // Profile
    perfil: {
      titulo: "My Profile",
      descripcion: "Manage your information and reforestation projects",
      misProyectos: "My Projects",
      noHayProyectos: "No registered projects",
      noRegistrado: "You haven't registered for any reforestation events yet",
      fecha: "Date",
      arboles: "Trees",
      voluntarios: "Volunteers",
      ubicacion: "Location",
      especies: "Species",
      registradoEl: "Registered on",
      cancelarRegistro: "Cancel Registration",
      verEstadisticas: "View Full Statistics",
    },

    // Project Map
    mapaProyectos: {
      filtrarEstado: "Filter by status:",
      todos: "All",
      proximo: "Upcoming",
      activo: "Active",
      finalizado: "Completed",
      fecha: "Date:",
      arboles: "Trees:",
      voluntarios: "Volunteers:",
      especies: "Species:",
    },
    
    // Registration modal
    modal: {
      seleccionaProyecto: "Select a Project",
      registroProyecto: "Project Registration",
      registrarse: "Register",
      nombreCompleto: "Full Name",
      email: "Email",
      telefono: "Phone",
      edad: "Age",
      experiencia: "Reforestation Experience",
      ninguna: "None",
      principiante: "Beginner (1-2 events)",
      intermedio: "Intermediate (3-5 events)",
      avanzado: "Advanced (more than 5 events)",
      comentarios: "Comments or Questions",
      volver: "Back",
      confirmarRegistro: "Confirm Registration",
      registrando: "Registering...",
      registroExitoso: "Registration Successful!",
      mensajeExito: "You have successfully registered for the project. Check your profile for more details.",
      cancelarRegistroTitulo: "Cancel Registration?",
      cancelarRegistroMsg: "Are you sure you want to cancel your registration for the project",
      noMantener: "No, Keep It",
      siCancelar: "Yes, Cancel",
    },
    
    // Project statuses
    estados: {
      activo: "Active",
      proximo: "Upcoming",
      completado: "Completed",
    },
    
    // Months
    meses: {
      enero: "January",
      febrero: "February",
      marzo: "March",
      abril: "April",
      mayo: "May",
      junio: "June",
      julio: "July",
      agosto: "August",
      septiembre: "September",
      octubre: "October",
      noviembre: "November",
      diciembre: "December",
    },
    
    // Login
    login: {
      titulo: "Welcome Back",
      subtitulo: "Sign in to your account to continue your green mission",
      email: "Email Address",
      contrasena: "Password",
      recordarme: "Remember me",
      olvidarContrasena: "Forgot your password?",
      iniciarSesion: "Sign In",
      iniciando: "Signing in...",
      noTienesCuenta: "Don't have an account?",
      registrate: "Sign up here",
      emailRequerido: "Email is required",
      contrasenaRequerida: "Password is required",
      credencialesInvalidas: "Invalid credentials",
    },
    
    // Register
    register: {
      titulo: "Join the Community",
      subtitulo: "Create your account and start planting trees",
      nombreCompleto: "Full Name",
      email: "Email Address",
      contrasena: "Password",
      confirmarContrasena: "Confirm Password",
      telefono: "Phone (optional)",
      ciudad: "City",
      aceptoTerminos: "I accept the terms and conditions",
      crearCuenta: "Create Account",
      creando: "Creating account...",
      yaTienesCuenta: "Already have an account?",
      iniciarSesion: "Sign in",
      nombreRequerido: "Full name is required",
      emailRequerido: "Email is required",
      contrasenaRequerida: "Password is required",
      contrasenasNoCoinciden: "Passwords don't match",
      ciudadRequerida: "City is required",
      aceptarTerminos: "You must accept the terms and conditions",
      registroExitoso: "Account created successfully!",
      emailYaRegistrado: "This email is already registered",
    },
    
    // Password recovery
    recuperar: {
      titulo: "Recover Password",
      subtitulo: "Enter your email and we'll send you instructions",
      email: "Email Address",
      enviarInstrucciones: "Send Instructions",
      enviando: "Sending...",
      volverLogin: "Back to sign in",
      exitoTitulo: "Check Your Email!",
      exitoMensaje: "We've sent password recovery instructions. Please check your inbox.",
      emailRequerido: "Email is required",
    },

    // My Projects (Profile)
    misProyectos: {
      titulo: "My Projects",
      noProyectos: "No registered projects",
      noProyectosDesc: "You haven't registered for any reforestation events yet",
      explorarProyectos: "Explore Projects",
      registradoEl: "Registered on",
      cancelarRegistro: "Cancel Registration",
      registrarAsistencia: "Register Attendance",
      actualizar: "Update",
      asistenciaRegistrada: "Attendance Registered",
      hasPlantado: "You have planted",
      arboles: "trees",
      fecha: "Date",
      voluntarios: "Volunteers",
      ubicacion: "Location",
      especies: "Species",
      
      // Cancellation modal
      cancelarTitulo: "Cancel Registration?",
      cancelarMensaje: "Are you sure you want to cancel your registration for the project",
      noMantener: "No, Keep It",
      siCancelar: "Yes, Cancel",
      
      // Attendance modal
      registrarAsistenciaTitulo: "Register Attendance",
      ingresaCantidad: "Enter the number of trees you planted in this project",
      arbolesPlantados: "Trees Planted",
      placeholderArboles: "e.g., 50",
      limiteProyecto: "Project limit",
      soloTuyos: "💡 Enter only the trees you personally planted",
      tuContribucion: "Your contribution is valuable!",
      ayudaraRastrear: "This information will help track the project's real impact",
      cancelar: "Cancel",
      confirmar: "Confirm",
      cantidadInvalida: "Please enter a valid number of planted trees",
      excedeLimite: "The amount cannot exceed the project limit ({max} trees)",
      asistenciaExito: "Attendance registered successfully! 🌳",
      errorRegistrar: "Error registering attendance",
    },

    // Impact Widget
    widgetImpacto: {
      tuImpacto: "YOUR IMPACT",
      arboles: "trees",
      plantados: "planted",
      faltan: "You need",
      arbolesParaMeta: "more trees to reach your weekly goal.",
      paraMeta: "for your weekly goal",
      metaCumplida: "Goal achieved!",
      metaSemanal: "Weekly Goal",
      progreso: "Progress",
      verEstadisticas: "View Full Statistics",
    },

    // Admin Widget
    widgetAdmin: {
      panel: "ADMIN PANEL",
      proyectos: "projects",
      activos: "active",
      voluntarios: "volunteers",
    },

    // Admin Panel
    admin: {
      titulo: "Administration Panel",
      subtitulo: "Manage reforestation projects in Manabí",
      nuevoProyecto: "New Project",
      noHayProyectos: "No projects",
      noHayProyectosDesc: "Start by adding your first reforestation project",
      agregarProyecto: "Add Project",
      
      // Form
      editarProyecto: "Edit Project",
      nombreProyecto: "Project Name",
      nombreProyectoPlaceholder: "e.g., Machalilla National Park Reforestation",
      ubicacion: "Location (City/Canton in Manabí)",
      seleccionaUbicacion: "Select a location",
      otraUbicacion: "Other location (custom)",
      escribeUbicacion: "Enter the location",
      coordenadas: "Coordinates",
      coordenadasAyuda: "Coordinates are automatically filled when you select a location",
      coordenadasPersonalizadas: "If you need custom coordinates, you can use",
      googleMaps: "Google Maps",
      googleMapsInfo: "(right-click → \"What's here?\")",
      latitud: "Latitude",
      longitud: "Longitude",
      numeroArboles: "Number of Trees",
      voluntariosNecesarios: "Volunteers Needed",
      especies: "Species (comma-separated)",
      especiesPlaceholder: "Guayacan, Ceibo, Fernan Sanchez",
      fechaEvento: "Event Date",
      estado: "Status",
      proximo: "Upcoming",
      activo: "Active",
      completado: "Completed",
      descripcion: "Description",
      descripcionPlaceholder: "Describe the reforestation project...",
      guardarCambios: "Save Changes",
      crearProyecto: "Create Project",
      cancelar: "Cancel",
      confirmarEliminar: "Are you sure you want to delete this project?",
      
      // Statistics
      verEstadisticas: "View Statistics",
      estadisticasProyecto: "Project Statistics",
      estadoProyecto: "Project Status",
      fecha: "Date",
      ubicacionLabel: "Location",
      progresoPlantacion: "Planting Progress",
      arbolesPlantadosDe: "of",
      arbolesPlantados: "trees planted",
      meta: "Goal",
      plantados: "Planted",
      restantes: "Remaining",
      participacionVoluntarios: "Volunteer Participation",
      voluntariosDe: "of",
      esperados: "Expected",
      participantes: "Participants",
      usuariosRegistrados: "Registered Users Who Attended",
      noHayAsistencias: "No users have registered their attendance yet",
      podranRegistrar: "Users will be able to register their attendance from their profile",
      arbolesPlantadosLabel: "Trees planted",
      informacionProyecto: "Project Information",
      especiesLabel: "Species",
      descripcionLabel: "Description",
      sinDescripcion: "No description",
      voluntariosEsperados: "volunteers",
      arbolesLabel: "Trees",
      voluntariosLabel: "Volunteers",
      especiesLabelCard: "Species",
      fechaLabel: "Date",
      coordenadas: "Coordinates",
    },
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    // Cargar idioma guardado
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        setLanguage(savedLanguage);
      }
    } catch (e) {
      console.error('Error loading language:', e);
    }

    // Escuchar cambios de idioma
    const handleLanguageChange = () => {
      try {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
          setLanguage(savedLanguage);
        }
      } catch (e) {
        console.error('Error updating language:', e);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
