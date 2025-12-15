-- ============================================
-- SCHEMA DE BASE DE DATOS PARA SUPABASE
-- Sistema de Reforestación Manabí
-- VERSIÓN 2.0 - Con Supabase Auth + Nuevos Formularios
-- ============================================

-- NOTA IMPORTANTE: Supabase Auth maneja la autenticación (tabla auth.users)
-- La tabla 'perfiles' extiende los datos de usuario de auth.users

-- ============================================
-- 1. TABLA DE PERFILES DE USUARIOS
-- ============================================
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  ciudad VARCHAR(100),
  avatar VARCHAR(500) DEFAULT '/avatars/user.jpg',
  role VARCHAR(20) DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'organizer', 'admin')),
  
  -- Campos específicos para organizadores
  organization_name VARCHAR(255),
  organization_website VARCHAR(500),
  organization_approved BOOLEAN DEFAULT false, -- Si la solicitud de organizador fue aprobada
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_perfiles_email ON perfiles(email);
CREATE INDEX idx_perfiles_role ON perfiles(role);

-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (
    id, 
    email, 
    nombre, 
    telefono, 
    ciudad, 
    role,
    organization_name,
    organization_website
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'ciudad',
    COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer'),
    NEW.raw_user_meta_data->>'organizationName',
    NEW.raw_user_meta_data->>'organizationWebsite'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. TABLA DE PROYECTOS DE REFORESTACIÓN
-- ============================================
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  
  -- Coordenadas geográficas
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  
  -- Información del proyecto
  fecha DATE NOT NULL,
  arboles INTEGER NOT NULL CHECK (arboles > 0),
  voluntarios_esperados INTEGER NOT NULL CHECK (voluntarios_esperados > 0),
  especies TEXT[], -- Array de especies nativas
  
  -- Estado del proyecto
  estado VARCHAR(20) DEFAULT 'Próximo' CHECK (estado IN ('Próximo', 'Activo', 'Completado', 'Cancelado')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES perfiles(id) ON DELETE SET NULL
);

-- Índices para búsquedas
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_fecha ON proyectos(fecha);
CREATE INDEX idx_proyectos_ubicacion ON proyectos(ubicacion);

-- ============================================
-- 3. TABLA DE ORGANIZADORES DE PROYECTOS
-- ============================================
CREATE TABLE proyecto_organizadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un organizador no puede estar duplicado en el mismo proyecto
  UNIQUE(proyecto_id, usuario_id)
);

CREATE INDEX idx_proyecto_organizadores_proyecto ON proyecto_organizadores(proyecto_id);
CREATE INDEX idx_proyecto_organizadores_usuario ON proyecto_organizadores(usuario_id);

-- ============================================
-- 4. TABLA DE REGISTROS A EVENTOS
-- ============================================
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  
  -- Información del voluntario
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  edad INTEGER CHECK (edad >= 16 AND edad <= 100),
  
  -- Información del voluntariado
  experiencia VARCHAR(50) NOT NULL CHECK (experiencia IN ('ninguna', 'basica', 'intermedia', 'avanzada')),
  disponibilidad VARCHAR(50) NOT NULL CHECK (disponibilidad IN ('completo', 'manana', 'tarde')),
  transporte VARCHAR(50) NOT NULL CHECK (transporte IN ('propio', 'publico', 'compartido', 'necesito_recogida')),
  comentarios TEXT,
  
  -- Estado del registro
  estado VARCHAR(20) DEFAULT 'confirmado' CHECK (estado IN ('confirmado', 'cancelado', 'asistio')),
  
  -- Metadata
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,
  
  -- Un usuario solo puede tener un registro activo por proyecto
  UNIQUE(proyecto_id, usuario_id, estado)
);

-- Índices
CREATE INDEX idx_registrations_proyecto ON event_registrations(proyecto_id);
CREATE INDEX idx_registrations_usuario ON event_registrations(usuario_id);
CREATE INDEX idx_registrations_estado ON event_registrations(estado);
CREATE INDEX idx_registrations_email ON event_registrations(user_email);

-- ============================================
-- 5. TABLA DE ASISTENCIAS
-- ============================================
CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE,
  
  -- Información de la asistencia
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  arboles_plantados INTEGER NOT NULL CHECK (arboles_plantados >= 0),
  
  -- Metadata
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede registrar una asistencia por proyecto
  UNIQUE(proyecto_id, usuario_id)
);

-- Índices
CREATE INDEX idx_asistencias_proyecto ON asistencias(proyecto_id);
CREATE INDEX idx_asistencias_usuario ON asistencias(usuario_id);
CREATE INDEX idx_asistencias_email ON asistencias(user_email);

-- ============================================
-- 6. TABLA DE PETICIONES DE PROYECTOS
-- ============================================
CREATE TABLE peticiones_proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con usuario solicitante
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  
  -- Información del proyecto solicitado
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  fecha DATE NOT NULL,
  arboles INTEGER NOT NULL CHECK (arboles > 0),
  voluntarios INTEGER NOT NULL CHECK (voluntarios > 0),
  especies TEXT NOT NULL, -- Se guardará como string separado por comas
  descripcion TEXT NOT NULL,
  
  -- Estado de la petición
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  
  -- Respuesta del admin
  respuesta_admin TEXT,
  revisado_por UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha_revision TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_peticiones_usuario ON peticiones_proyectos(usuario_id);
CREATE INDEX idx_peticiones_estado ON peticiones_proyectos(estado);
CREATE INDEX idx_peticiones_fecha ON peticiones_proyectos(fecha);

-- ============================================
-- 7. TABLA DE DONACIONES
-- ============================================
CREATE TABLE donaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con usuario (puede ser anónimo)
  usuario_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  
  -- Información del donante
  nombre_donante VARCHAR(255) NOT NULL,
  email_donante VARCHAR(255) NOT NULL,
  telefono_donante VARCHAR(20),
  
  -- Información de la donación
  tipo_donacion VARCHAR(50) NOT NULL CHECK (tipo_donacion IN ('unica', 'mensual', 'anual')),
  monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
  moneda VARCHAR(3) DEFAULT 'USD',
  
  -- Proyecto específico o donación general
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
  es_donacion_general BOOLEAN DEFAULT true,
  
  -- Método de pago
  metodo_pago_id UUID REFERENCES metodos_pago(id) ON DELETE SET NULL,
  
  -- Estado de la transacción
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')),
  transaction_id VARCHAR(255), -- ID de transacción del procesador de pago
  
  -- Opciones adicionales
  es_anonimo BOOLEAN DEFAULT false,
  mensaje TEXT,
  recibo_enviado BOOLEAN DEFAULT false,
  
  -- Metadata
  fecha_donacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_procesado TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_donaciones_usuario ON donaciones(usuario_id);
CREATE INDEX idx_donaciones_proyecto ON donaciones(proyecto_id);
CREATE INDEX idx_donaciones_estado ON donaciones(estado);
CREATE INDEX idx_donaciones_fecha ON donaciones(fecha_donacion);

-- ============================================
-- 8. TABLA DE MÉTODOS DE PAGO
-- ============================================
CREATE TABLE metodos_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con usuario
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  
  -- Información del método de pago
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('tarjeta_credito', 'tarjeta_debito', 'paypal', 'transferencia', 'efectivo')),
  
  -- Para tarjetas (encriptado o tokenizado)
  ultimos_4_digitos VARCHAR(4),
  marca VARCHAR(20), -- Visa, Mastercard, etc.
  nombre_titular VARCHAR(255),
  fecha_expiracion VARCHAR(7), -- MM/YYYY
  
  -- Para PayPal
  paypal_email VARCHAR(255),
  
  -- Para transferencias
  banco VARCHAR(100),
  numero_cuenta_ultimos_4 VARCHAR(4),
  
  -- Configuración
  es_predeterminado BOOLEAN DEFAULT false,
  esta_activo BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_metodos_pago_usuario ON metodos_pago(usuario_id);
CREATE INDEX idx_metodos_pago_predeterminado ON metodos_pago(es_predeterminado);

-- ============================================
-- 9. TABLA DE SOLICITUDES DE ORGANIZADOR
-- ============================================
CREATE TABLE solicitudes_organizador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con usuario
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  
  -- Información de la organización
  nombre_organizacion VARCHAR(255) NOT NULL,
  tipo_organizacion VARCHAR(50) NOT NULL CHECK (tipo_organizacion IN ('ong', 'empresa', 'gobierno', 'educativa', 'comunitaria', 'otra')),
  sitio_web VARCHAR(500),
  
  -- Información de contacto
  telefono_organizacion VARCHAR(20) NOT NULL,
  direccion TEXT,
  
  -- Justificación
  experiencia_previa TEXT NOT NULL,
  proyectos_realizados TEXT,
  motivacion TEXT NOT NULL,
  capacidad_recursos TEXT, -- Descripción de recursos disponibles
  
  -- Documentación
  documentos_adjuntos TEXT[], -- URLs de documentos (registro legal, etc.)
  
  -- Estado de la solicitud
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'aprobado', 'rechazado')),
  
  -- Revisión
  revisado_por UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha_revision TIMESTAMP WITH TIME ZONE,
  comentarios_revision TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_solicitudes_organizador_usuario ON solicitudes_organizador(usuario_id);
CREATE INDEX idx_solicitudes_organizador_estado ON solicitudes_organizador(estado);

-- ============================================
-- 10. TABLA DE PRÉSTAMO DE HERRAMIENTAS/VEHÍCULOS
-- ============================================
CREATE TABLE prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con usuario solicitante
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  
  -- Relación con proyecto
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
  
  -- Tipo de préstamo
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('herramienta', 'vehiculo', 'equipo')),
  
  -- Información del item
  item VARCHAR(255) NOT NULL,
  descripcion TEXT,
  cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0),
  
  -- Fechas
  fecha_prestamo DATE NOT NULL,
  fecha_devolucion_esperada DATE NOT NULL,
  fecha_devolucion_real DATE,
  
  -- Estado
  estado VARCHAR(20) DEFAULT 'solicitado' CHECK (estado IN ('solicitado', 'aprobado', 'en_uso', 'devuelto', 'rechazado', 'perdido_danado')),
  
  -- Información adicional
  proposito TEXT NOT NULL,
  responsable_nombre VARCHAR(255) NOT NULL,
  responsable_telefono VARCHAR(20) NOT NULL,
  
  -- Condición
  condicion_prestamo VARCHAR(50) CHECK (condicion_prestamo IN ('excelente', 'buena', 'aceptable', 'danada')),
  condicion_devolucion VARCHAR(50) CHECK (condicion_devolucion IN ('excelente', 'buena', 'aceptable', 'danada')),
  notas_devolucion TEXT,
  
  -- Aprobación
  aprobado_por UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  comentarios_admin TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_prestamos_usuario ON prestamos(usuario_id);
CREATE INDEX idx_prestamos_proyecto ON prestamos(proyecto_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);
CREATE INDEX idx_prestamos_fecha_prestamo ON prestamos(fecha_prestamo);

-- ============================================
-- 11. TABLA DE REPORTE DE INCIDENTES
-- ============================================
CREATE TABLE reportes_incidentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con usuario reportante
  reportado_por UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  
  -- Relación con proyecto (opcional)
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
  
  -- Tipo de incidente
  tipo_incidente VARCHAR(50) NOT NULL CHECK (tipo_incidente IN (
    'accidente_persona',
    'dano_propiedad',
    'problema_tecnico',
    'conflicto_interpersonal',
    'robo_perdida',
    'problema_ambiental',
    'otro'
  )),
  
  -- Severidad
  severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('baja', 'media', 'alta', 'critica')),
  
  -- Información del incidente
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_incidente TIMESTAMP WITH TIME ZONE NOT NULL,
  ubicacion_incidente TEXT,
  
  -- Personas involucradas
  personas_involucradas TEXT,
  testigos TEXT,
  
  -- Daños y acciones
  danos_reportados TEXT,
  acciones_inmediatas TEXT,
  requiere_seguimiento BOOLEAN DEFAULT false,
  
  -- Evidencia
  fotos_adjuntas TEXT[], -- URLs de fotos
  documentos_adjuntos TEXT[], -- URLs de documentos
  
  -- Estado
  estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_investigacion', 'resuelto', 'cerrado')),
  
  -- Seguimiento
  asignado_a UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha_asignacion TIMESTAMP WITH TIME ZONE,
  resolucion TEXT,
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reportes_usuario ON reportes_incidentes(reportado_por);
CREATE INDEX idx_reportes_proyecto ON reportes_incidentes(proyecto_id);
CREATE INDEX idx_reportes_tipo ON reportes_incidentes(tipo_incidente);
CREATE INDEX idx_reportes_severidad ON reportes_incidentes(severidad);
CREATE INDEX idx_reportes_estado ON reportes_incidentes(estado);
CREATE INDEX idx_reportes_fecha ON reportes_incidentes(fecha_incidente);

-- ============================================
-- 12. TABLA DE RECOMENDACIONES DE MEJORA
-- ============================================
CREATE TABLE recomendaciones_mejora (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con usuario
  usuario_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  
  -- Información del usuario (si no está autenticado)
  nombre_usuario VARCHAR(255),
  email_usuario VARCHAR(255),
  
  -- Categoría de la recomendación
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
    'interfaz',
    'funcionalidad',
    'contenido',
    'rendimiento',
    'accesibilidad',
    'seguridad',
    'proyecto_campo',
    'comunicacion',
    'otra'
  )),
  
  -- Prioridad sugerida por el usuario
  prioridad_sugerida VARCHAR(20) CHECK (prioridad_sugerida IN ('baja', 'media', 'alta')),
  
  -- Información de la recomendación
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  pagina_url VARCHAR(500), -- Página donde encontró el problema
  
  -- Beneficio esperado
  beneficio_esperado TEXT,
  
  -- Capturas de pantalla
  capturas_pantalla TEXT[], -- URLs de imágenes
  
  -- Estado
  estado VARCHAR(20) DEFAULT 'nuevo' CHECK (estado IN (
    'nuevo',
    'en_revision',
    'aceptado',
    'en_desarrollo',
    'implementado',
    'rechazado',
    'duplicado'
  )),
  
  -- Gestión interna
  prioridad_asignada VARCHAR(20) CHECK (prioridad_asignada IN ('baja', 'media', 'alta', 'critica')),
  asignado_a UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha_asignacion TIMESTAMP WITH TIME ZONE,
  notas_internas TEXT,
  fecha_implementacion TIMESTAMP WITH TIME ZONE,
  
  -- Respuesta al usuario
  respuesta_admin TEXT,
  fecha_respuesta TIMESTAMP WITH TIME ZONE,
  
  -- Votación (para priorizar mejoras)
  votos_positivos INTEGER DEFAULT 0,
  votos_negativos INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_recomendaciones_usuario ON recomendaciones_mejora(usuario_id);
CREATE INDEX idx_recomendaciones_categoria ON recomendaciones_mejora(categoria);
CREATE INDEX idx_recomendaciones_estado ON recomendaciones_mejora(estado);
CREATE INDEX idx_recomendaciones_prioridad ON recomendaciones_mejora(prioridad_asignada);

-- ============================================
-- 13. TRIGGERS PARA UPDATED_AT
-- ============================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asistencias_updated_at BEFORE UPDATE ON asistencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peticiones_updated_at BEFORE UPDATE ON peticiones_proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metodos_pago_updated_at BEFORE UPDATE ON metodos_pago
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitudes_organizador_updated_at BEFORE UPDATE ON solicitudes_organizador
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestamos_updated_at BEFORE UPDATE ON prestamos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reportes_incidentes_updated_at BEFORE UPDATE ON reportes_incidentes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recomendaciones_mejora_updated_at BEFORE UPDATE ON recomendaciones_mejora
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_organizadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE peticiones_proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE donaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE metodos_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_organizador ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendaciones_mejora ENABLE ROW LEVEL SECURITY;

-- Políticas para PERFILES
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON perfiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON perfiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles" ON perfiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para PROYECTOS
CREATE POLICY "Todos pueden ver proyectos" ON proyectos
  FOR SELECT USING (true);

CREATE POLICY "Solo admins y organizadores pueden crear proyectos" ON proyectos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Solo admins y creadores pueden editar proyectos" ON proyectos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR id = proyectos.created_by)
    )
  );

CREATE POLICY "Solo admins pueden eliminar proyectos" ON proyectos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para EVENT_REGISTRATIONS
CREATE POLICY "Usuarios pueden ver sus propios registros" ON event_registrations
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear registros" ON event_registrations
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus registros" ON event_registrations
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Admins pueden ver todos los registros" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para ASISTENCIAS
CREATE POLICY "Usuarios pueden ver sus propias asistencias" ON asistencias
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear sus asistencias" ON asistencias
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus asistencias" ON asistencias
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Admins pueden ver todas las asistencias" ON asistencias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para PETICIONES DE PROYECTOS
CREATE POLICY "Usuarios pueden ver sus propias peticiones" ON peticiones_proyectos
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear peticiones" ON peticiones_proyectos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins pueden ver todas las peticiones" ON peticiones_proyectos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar peticiones" ON peticiones_proyectos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para DONACIONES
CREATE POLICY "Usuarios pueden ver sus propias donaciones" ON donaciones
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear donaciones" ON donaciones
  FOR INSERT WITH CHECK (usuario_id = auth.uid() OR usuario_id IS NULL);

CREATE POLICY "Admins pueden ver todas las donaciones" ON donaciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para MÉTODOS DE PAGO
CREATE POLICY "Usuarios pueden ver sus propios métodos de pago" ON metodos_pago
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden gestionar sus métodos de pago" ON metodos_pago
  FOR ALL USING (usuario_id = auth.uid());

-- Políticas para SOLICITUDES DE ORGANIZADOR
CREATE POLICY "Usuarios pueden ver sus propias solicitudes" ON solicitudes_organizador
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear solicitudes" ON solicitudes_organizador
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins pueden ver todas las solicitudes" ON solicitudes_organizador
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar solicitudes" ON solicitudes_organizador
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para PRÉSTAMOS
CREATE POLICY "Usuarios pueden ver sus propios préstamos" ON prestamos
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear solicitudes de préstamo" ON prestamos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus préstamos" ON prestamos
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Admins pueden ver todos los préstamos" ON prestamos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden gestionar préstamos" ON prestamos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para REPORTES DE INCIDENTES
CREATE POLICY "Usuarios pueden ver sus propios reportes" ON reportes_incidentes
  FOR SELECT USING (reportado_por = auth.uid());

CREATE POLICY "Usuarios pueden crear reportes" ON reportes_incidentes
  FOR INSERT WITH CHECK (reportado_por = auth.uid() OR reportado_por IS NULL);

CREATE POLICY "Admins pueden ver todos los reportes" ON reportes_incidentes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden gestionar reportes" ON reportes_incidentes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para RECOMENDACIONES DE MEJORA
CREATE POLICY "Todos pueden ver recomendaciones públicas" ON recomendaciones_mejora
  FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden crear recomendaciones" ON recomendaciones_mejora
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar sus recomendaciones" ON recomendaciones_mejora
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Admins pueden gestionar todas las recomendaciones" ON recomendaciones_mejora
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 15. VISTAS ÚTILES
-- ============================================

-- Vista de estadísticas por proyecto
CREATE OR REPLACE VIEW vista_estadisticas_proyectos AS
SELECT 
  p.id,
  p.nombre,
  p.ubicacion,
  p.fecha,
  p.estado,
  p.arboles AS arboles_objetivo,
  p.voluntarios_esperados,
  COUNT(DISTINCT er.id) FILTER (WHERE er.estado = 'confirmado') AS registros_confirmados,
  COUNT(DISTINCT a.id) AS asistencias_registradas,
  COALESCE(SUM(a.arboles_plantados), 0) AS arboles_plantados_reales,
  COALESCE(SUM(d.monto), 0) AS total_donaciones,
  ROUND(
    (COALESCE(SUM(a.arboles_plantados), 0)::DECIMAL / NULLIF(p.arboles, 0)) * 100, 
    2
  ) AS porcentaje_completado
FROM proyectos p
LEFT JOIN event_registrations er ON p.id = er.proyecto_id
LEFT JOIN asistencias a ON p.id = a.proyecto_id
LEFT JOIN donaciones d ON p.id = d.proyecto_id AND d.estado = 'completado'
GROUP BY p.id, p.nombre, p.ubicacion, p.fecha, p.estado, p.arboles, p.voluntarios_esperados;

-- Vista de impacto por usuario
CREATE OR REPLACE VIEW vista_impacto_usuarios AS
SELECT 
  u.id,
  u.nombre,
  u.email,
  u.role,
  COUNT(DISTINCT er.id) FILTER (WHERE er.estado = 'confirmado') AS proyectos_registrados,
  COUNT(DISTINCT a.id) AS proyectos_asistidos,
  COALESCE(SUM(a.arboles_plantados), 0) AS total_arboles_plantados,
  COALESCE(SUM(d.monto), 0) AS total_donado
FROM perfiles u
LEFT JOIN event_registrations er ON u.id = er.usuario_id
LEFT JOIN asistencias a ON u.id = a.usuario_id
LEFT JOIN donaciones d ON u.id = d.usuario_id AND d.estado = 'completado'
GROUP BY u.id, u.nombre, u.email, u.role;

-- Vista de dashboard administrativo
CREATE OR REPLACE VIEW vista_dashboard_admin AS
SELECT 
  (SELECT COUNT(*) FROM perfiles) AS total_usuarios,
  (SELECT COUNT(*) FROM perfiles WHERE role = 'volunteer') AS total_voluntarios,
  (SELECT COUNT(*) FROM perfiles WHERE role = 'organizer') AS total_organizadores,
  (SELECT COUNT(*) FROM proyectos) AS total_proyectos,
  (SELECT COUNT(*) FROM proyectos WHERE estado = 'Activo') AS proyectos_activos,
  (SELECT COUNT(*) FROM event_registrations WHERE estado = 'confirmado') AS total_registros,
  (SELECT COUNT(*) FROM asistencias) AS total_asistencias,
  (SELECT COALESCE(SUM(arboles_plantados), 0) FROM asistencias) AS arboles_plantados_total,
  (SELECT COALESCE(SUM(monto), 0) FROM donaciones WHERE estado = 'completado') AS donaciones_totales,
  (SELECT COUNT(*) FROM solicitudes_organizador WHERE estado = 'pendiente') AS solicitudes_pendientes,
  (SELECT COUNT(*) FROM reportes_incidentes WHERE estado IN ('abierto', 'en_investigacion')) AS incidentes_abiertos,
  (SELECT COUNT(*) FROM prestamos WHERE estado IN ('solicitado', 'aprobado')) AS prestamos_activos;

-- ============================================
-- 16. FUNCIONES ÚTILES
-- ============================================

-- Función para obtener registros activos de un usuario
CREATE OR REPLACE FUNCTION get_user_active_registrations(user_id_param UUID)
RETURNS TABLE (
  registration_id UUID,
  proyecto_id UUID,
  proyecto_nombre VARCHAR,
  proyecto_fecha DATE,
  estado VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    er.id,
    p.id,
    p.nombre,
    p.fecha,
    er.estado
  FROM event_registrations er
  JOIN proyectos p ON er.proyecto_id = p.id
  WHERE er.usuario_id = user_id_param
    AND er.estado IN ('confirmado', 'asistio')
  ORDER BY p.fecha DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario ya está registrado en un proyecto
CREATE OR REPLACE FUNCTION is_user_registered_in_project(
  user_id_param UUID,
  project_id_param UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM event_registrations 
    WHERE usuario_id = user_id_param 
      AND proyecto_id = project_id_param 
      AND estado = 'confirmado'
  );
END;
$$ LANGUAGE plpgsql;

-- Función para calcular estadísticas globales
CREATE OR REPLACE FUNCTION get_global_statistics()
RETURNS TABLE (
  total_proyectos BIGINT,
  total_usuarios BIGINT,
  total_voluntarios BIGINT,
  total_registros BIGINT,
  total_asistencias BIGINT,
  total_arboles_plantados BIGINT,
  total_donaciones NUMERIC,
  proyectos_activos BIGINT,
  proyectos_proximos BIGINT,
  proyectos_completados BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id)::BIGINT,
    COUNT(DISTINCT u.id)::BIGINT,
    (COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'volunteer'))::BIGINT,
    (COUNT(DISTINCT er.id) FILTER (WHERE er.estado = 'confirmado'))::BIGINT,
    COUNT(DISTINCT a.id)::BIGINT,
    COALESCE(SUM(a.arboles_plantados), 0)::BIGINT,
    COALESCE(SUM(d.monto) FILTER (WHERE d.estado = 'completado'), 0)::NUMERIC,
    (COUNT(DISTINCT p.id) FILTER (WHERE p.estado = 'Activo'))::BIGINT,
    (COUNT(DISTINCT p.id) FILTER (WHERE p.estado = 'Próximo'))::BIGINT,
    (COUNT(DISTINCT p.id) FILTER (WHERE p.estado = 'Completado'))::BIGINT
  FROM proyectos p
  CROSS JOIN perfiles u
  LEFT JOIN event_registrations er ON p.id = er.proyecto_id
  LEFT JOIN asistencias a ON p.id = a.proyecto_id
  LEFT JOIN donaciones d ON p.id = d.proyecto_id;
END;
$$ LANGUAGE plpgsql;

-- Función para aprobar solicitud de organizador
CREATE OR REPLACE FUNCTION aprobar_solicitud_organizador(
  solicitud_id_param UUID,
  admin_id_param UUID,
  comentarios_param TEXT
)
RETURNS VOID AS $$
DECLARE
  usuario_solicitante UUID;
BEGIN
  -- Obtener el ID del usuario solicitante
  SELECT usuario_id INTO usuario_solicitante
  FROM solicitudes_organizador
  WHERE id = solicitud_id_param;
  
  -- Actualizar la solicitud
  UPDATE solicitudes_organizador
  SET 
    estado = 'aprobado',
    revisado_por = admin_id_param,
    fecha_revision = NOW(),
    comentarios_revision = comentarios_param
  WHERE id = solicitud_id_param;
  
  -- Actualizar el perfil del usuario
  UPDATE perfiles
  SET 
    role = 'organizer',
    organization_approved = true
  WHERE id = usuario_solicitante;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- Comentarios sobre el schema:
-- 1. Separación de auth.users (Supabase Auth) y perfiles (datos extendidos)
-- 2. Trigger automático para crear perfil cuando se registra un usuario
-- 3. 12 tablas principales con todas las funcionalidades
-- 4. Row Level Security (RLS) en todas las tablas
-- 5. Triggers para updated_at automático
-- 6. Vistas optimizadas para dashboards
-- 7. Funciones útiles para lógica de negocio
-- 8. Índices para búsquedas rápidas
-- 9. Constraints para integridad de datos
-- 10. Soporte para donaciones, préstamos, incidentes y más
