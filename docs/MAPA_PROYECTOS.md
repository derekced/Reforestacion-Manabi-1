# Mapa de Proyectos de Reforestación

## Características

La nueva interfaz de proyectos incluye:

### 🗺️ Mapa Interactivo
- Mapa interactivo de Manabí utilizando Leaflet
- Marcadores personalizados con iconos de árboles
- Colores diferentes según el estado del proyecto:
  - 🟢 Verde: Proyectos completados
  - 🔵 Azul: Proyectos activos
  - 🟠 Naranja: Proyectos próximos

### 📍 12 Ubicaciones de Proyectos
1. **Playa de Cojimíes** - Restauración de manglares
2. **Bosque Urbano Portoviejo** - Creación de bosque urbano
3. **Reserva Ecológica Mache-Chindul** - Restauración de áreas degradadas
4. **Zona Costera Bahía de Caráquez** - Protección costera
5. **Cuenca del Río Chone** - Protección de cuencas hídricas
6. **Parque Nacional Machalilla** - Conservación del bosque seco
7. **Zona Rural de Jipijapa** - Reforestación comunitaria
8. **Corredor Ecológico El Carmen** - Conectividad de bosques
9. **Playa San Vicente** - Estabilización de dunas
10. **Comunidad de Montecristi** - Reforestación patrimonial
11. **Cuenca Alta del Río Portoviejo** - Protección de fuentes de agua
12. **Zona de Amortiguamiento Pacoche** - Ampliación del refugio

### 📊 Información Detallada
Cada marcador muestra:
- Nombre del proyecto
- Estado (Completado/Activo/Próximo)
- Descripción
- Fecha del evento
- Número de árboles plantados
- Cantidad de voluntarios
- Especies nativas utilizadas

### 🎛️ Filtros
- Filtrar proyectos por estado
- Contador dinámico de proyectos mostrados

### 📈 Estadísticas Generales
- Total de proyectos: 12
- Árboles plantados: 15,420
- Voluntarios participantes: 1,234

## Tecnologías Utilizadas
- **Leaflet**: Biblioteca de mapas de código abierto
- **React Leaflet**: Integración de Leaflet con React
- **Next.js**: Framework de React
- **Tailwind CSS**: Estilos

## Cómo Acceder
1. Navega a la aplicación
2. Haz clic en "Proyectos" en el sidebar
3. Explora el mapa interactivo
4. Haz clic en los marcadores para ver información detallada

## Estructura de Archivos
```
src/
├── app/
│   └── proyectos/
│       └── page.js          # Página principal de proyectos
└── components/
    └── proyectos/
        └── MapaProyectos.jsx # Componente del mapa interactivo
```

## Próximas Mejoras
- [ ] Integración con base de datos real
- [ ] Sistema de búsqueda de proyectos
- [ ] Vista de lista además del mapa
- [ ] Detalles ampliados en modal
- [ ] Galería de fotos por proyecto
- [ ] Sistema de registro para voluntarios
