"use client";

import { useState, useEffect } from 'react';
import { X, TreePine, CalendarDays, Users, CheckCircle2, FileText } from 'lucide-react';

// Importar los eventos desde MapaProyectos
const eventosReforestacion = [
  {
    id: 1,
    nombre: "Reforestación Playa de Cojimíes",
    lat: -0.3567,
    lng: -79.9167,
    fecha: "15 de Noviembre, 2025",
    arboles: 1500,
    voluntarios: 85,
    especies: ["Mangle rojo", "Mangle negro", "Laurel"],
    descripcion: "Proyecto de restauración de manglares costeros en la zona de Cojimíes.",
    estado: "Activo"
  },
  {
    id: 2,
    nombre: "Bosque Urbano Portoviejo",
    lat: -1.0543,
    lng: -80.4553,
    fecha: "22 de Noviembre, 2025",
    arboles: 2000,
    voluntarios: 150,
    especies: ["Guayacán", "Ceibo", "Algarrobo"],
    descripcion: "Creación de un bosque urbano en la capital de Manabí.",
    estado: "Próximo"
  },
  {
    id: 4,
    nombre: "Zona Costera Bahía de Caráquez",
    lat: -0.6,
    lng: -80.4167,
    fecha: "5 de Diciembre, 2025",
    arboles: 1200,
    voluntarios: 95,
    especies: ["Mangle", "Almendro", "Cocotero"],
    descripcion: "Protección de la línea costera mediante reforestación.",
    estado: "Próximo"
  },
  {
    id: 6,
    nombre: "Parque Nacional Machalilla",
    lat: -1.6167,
    lng: -80.7167,
    fecha: "18 de Noviembre, 2025",
    arboles: 1800,
    voluntarios: 75,
    especies: ["Palo Santo", "Ceibo", "Barbasco"],
    descripcion: "Conservación del bosque seco tropical.",
    estado: "Activo"
  },
  {
    id: 7,
    nombre: "Zona Rural de Jipijapa",
    lat: -1.3486,
    lng: -80.5783,
    fecha: "3 de Diciembre, 2025",
    arboles: 900,
    voluntarios: 60,
    especies: ["Guayacán", "Algarrobo", "Moyuyo"],
    descripcion: "Reforestación comunitaria en zonas agrícolas.",
    estado: "Próximo"
  },
  {
    id: 9,
    nombre: "Playa San Vicente",
    lat: -0.6294,
    lng: -80.3889,
    fecha: "25 de Noviembre, 2025",
    arboles: 1100,
    voluntarios: 80,
    especies: ["Almendro de playa", "Cocotero", "Uva de playa"],
    descripcion: "Estabilización de dunas costeras.",
    estado: "Próximo"
  },
  {
    id: 11,
    nombre: "Cuenca Alta del Río Portoviejo",
    lat: -1.1667,
    lng: -80.3333,
    fecha: "30 de Noviembre, 2025",
    arboles: 2800,
    voluntarios: 135,
    especies: ["Guadúa", "Laurel", "Cedro"],
    descripcion: "Protección de fuentes de agua y prevención de erosión.",
    estado: "Activo"
  },
  {
    id: 12,
    nombre: "Zona de Amortiguamiento Pacoche",
    lat: -1.0833,
    lng: -80.8333,
    fecha: "15 de Diciembre, 2025",
    arboles: 1400,
    voluntarios: 70,
    especies: ["Pechiche", "Ceibo", "Matapalo"],
    descripcion: "Ampliación del refugio de vida silvestre.",
    estado: "Próximo"
  }
];

export default function ModalRegistroEvento({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: seleccionar evento, 2: formulario
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    edad: '',
    experiencia: 'ninguna',
    comentarios: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Obtener usuario autenticado
  useEffect(() => {
    if (isOpen) {
      try {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          const userData = JSON.parse(authUser);
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            nombre: userData.name || userData.username || '',
            email: userData.email || ''
          }));
        }
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }
  }, [isOpen]);

  // Filtrar solo eventos disponibles (Activo o Próximo)
  const eventosDisponibles = eventosReforestacion.filter(
    e => e.estado === 'Activo' || e.estado === 'Próximo'
  );

  const handleSelectEvent = (evento) => {
    setSelectedEvent(evento);
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular proceso de registro
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Guardar registro en localStorage
    try {
      const registros = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
      const nuevoRegistro = {
        id: Date.now(),
        eventoId: selectedEvent.id,
        evento: selectedEvent,
        usuario: formData,
        fechaRegistro: new Date().toISOString(),
        estado: 'confirmado'
      };
      
      registros.push(nuevoRegistro);
      localStorage.setItem('eventRegistrations', JSON.stringify(registros));
      
      // Disparar evento personalizado
      window.dispatchEvent(new Event('registrationChange'));
      
      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error al registrar:', error);
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedEvent(null);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      edad: '',
      experiencia: 'ninguna',
      comentarios: ''
    });
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {step === 1 ? (
              <>
                <TreePine className="w-6 h-6" />
                Selecciona un Proyecto
              </>
            ) : (
              <>
                <FileText className="w-6 h-6" />
                Registro al Proyecto
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {showSuccess ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                ¡Registro Exitoso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Te has registrado exitosamente al proyecto. Revisa tu perfil para más detalles.
              </p>
            </div>
          ) : step === 1 ? (
            /* Lista de eventos */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventosDisponibles.map((evento) => (
                <div
                  key={evento.id}
                  onClick={() => handleSelectEvent(evento)}
                  className="group cursor-pointer border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                      {evento.nombre}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      evento.estado === 'Activo' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {evento.estado}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {evento.descripcion}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <span>{evento.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <TreePine className="w-4 h-4 text-green-500" />
                      <span>{evento.arboles} árboles</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>{evento.voluntarios} voluntarios</span>
                    </div>
                  </div>
                  
                  <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                    Registrarse →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Formulario de registro */
            <div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-green-800 dark:text-green-400 mb-2">
                  {selectedEvent.nombre}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    <span>{selectedEvent.fecha}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TreePine className="w-4 h-4" />
                    <span>{selectedEvent.arboles} árboles</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0999999999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Edad *
                    </label>
                    <input
                      type="number"
                      name="edad"
                      value={formData.edad}
                      onChange={handleInputChange}
                      required
                      min="16"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="18"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experiencia en Reforestación
                  </label>
                  <select
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="ninguna">Ninguna</option>
                    <option value="principiante">Principiante (1-2 eventos)</option>
                    <option value="intermedio">Intermedio (3-5 eventos)</option>
                    <option value="avanzado">Avanzado (más de 5 eventos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comentarios o Preguntas
                  </label>
                  <textarea
                    name="comentarios"
                    value={formData.comentarios}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="¿Tienes alguna pregunta o comentario?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? 'Registrando...' : 'Confirmar Registro'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
