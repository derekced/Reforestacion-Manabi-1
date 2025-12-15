-- ============================================
-- SCHEMA DE BASE DE DATOS PARA SUPABASE
-- Sistema de Reforestación Manabí
-- ============================================

-- NOTA: Supabase Auth maneja la autenticación (tabla auth.users)
-- Esta tabla 'perfiles' extiende los datos de usuario

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
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  
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
-- 7. TRIGGERS PARA UPDATED_AT
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
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asistencias_updated_at BEFORE UPDATE ON asistencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peticiones_updated_at BEFORE UPDATE ON peticiones_proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_organizadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE peticiones_proyectos ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los usuarios" ON usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para PROYECTOS
CREATE POLICY "Todos pueden ver proyectos" ON proyectos
  FOR SELECT USING (true);

CREATE POLICY "Solo admins y organizadores pueden crear proyectos" ON proyectos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Solo admins y creadores pueden editar proyectos" ON proyectos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR id = proyectos.created_by)
    )
  );

CREATE POLICY "Solo admins pueden eliminar proyectos" ON proyectos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
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
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
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
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para PETICIONES
CREATE POLICY "Usuarios pueden ver sus propias peticiones" ON peticiones_proyectos
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear peticiones" ON peticiones_proyectos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins pueden ver todas las peticiones" ON peticiones_proyectos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar peticiones" ON peticiones_proyectos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 9. VISTAS ÚTILES
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
  ROUND(
    (COALESCE(SUM(a.arboles_plantados), 0)::DECIMAL / NULLIF(p.arboles, 0)) * 100, 
    2
  ) AS porcentaje_completado
FROM proyectos p
LEFT JOIN event_registrations er ON p.id = er.proyecto_id
LEFT JOIN asistencias a ON p.id = a.proyecto_id
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
  COALESCE(SUM(a.arboles_plantados), 0) AS total_arboles_plantados
FROM usuarios u
LEFT JOIN event_registrations er ON u.id = er.usuario_id
LEFT JOIN asistencias a ON u.id = a.usuario_id
GROUP BY u.id, u.nombre, u.email, u.role;

-- ============================================
-- 10. FUNCIONES ÚTILES
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
  proyectos_activos BIGINT,
  proyectos_proximos BIGINT,
  proyectos_completados BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id),
    COUNT(DISTINCT u.id),
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'volunteer'),
    COUNT(DISTINCT er.id) FILTER (WHERE er.estado = 'confirmado'),
    COUNT(DISTINCT a.id),
    COALESCE(SUM(a.arboles_plantados), 0),
    COUNT(DISTINCT p.id) FILTER (WHERE p.estado = 'Activo'),
    COUNT(DISTINCT p.id) FILTER (WHERE p.estado = 'Próximo'),
    COUNT(DISTINCT p.id) FILTER (WHERE p.estado = 'Completado')
  FROM proyectos p
  CROSS JOIN usuarios u
  LEFT JOIN event_registrations er ON p.id = er.proyecto_id
  LEFT JOIN asistencias a ON p.id = a.proyecto_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- ============================================

/*
-- Insertar usuario administrador
INSERT INTO usuarios (email, nombre, password_hash, role)
VALUES ('admin@reforestacion.com', 'Administrador', '$2a$10$...', 'admin');

-- Insertar proyectos de ejemplo
INSERT INTO proyectos (nombre, ubicacion, descripcion, lat, lng, fecha, arboles, voluntarios_esperados, especies, estado)
VALUES 
  ('Reforestación Parque Nacional Machalilla', 'Puerto López', 'Recuperación de bosque seco tropical en el Parque Nacional Machalilla', -1.5514, -80.8186, '2025-02-15', 2500, 150, ARRAY['Guayacán', 'Ceibo', 'Fernán Sánchez'], 'Próximo'),
  ('Bosque Urbano Manta', 'Manta', 'Creación de bosque urbano en la zona costera de Manta', -0.9537, -80.7089, '2025-01-20', 1200, 80, ARRAY['Neem', 'Almendro', 'Laurel'], 'Activo');
*/

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- Comentarios sobre el schema:
-- 1. Todas las tablas usan UUID como primary key para mejor escalabilidad
-- 2. Se implementa Row Level Security (RLS) para control de acceso granular
-- 3. Los triggers mantienen automáticamente los campos updated_at
-- 4. Las vistas proporcionan consultas comunes pre-calculadas
-- 5. Las funciones encapsulan lógica de negocio común
-- 6. Los índices optimizan las consultas más frecuentes
-- 7. Las constraints aseguran integridad de datos
