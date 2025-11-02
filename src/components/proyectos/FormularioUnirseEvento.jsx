"use client";

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

export default function FormularioUnirseEvento({ evento, isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    edad: '',
    experiencia: 'ninguna',
    disponibilidad: 'completo',
    transporte: 'propio',
    comentarios: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const authUserLocal = localStorage.getItem('authUser');
        const authUserSession = sessionStorage.getItem('authUser');
        const authRaw = authUserLocal || authUserSession;
        
        if (authRaw) {
          const userData = JSON.parse(authRaw);
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.telefono.replaceAll(/\D/g, ''))) {
      newErrors.telefono = 'Teléfono debe tener 10 dígitos';
    }
    
    if (!formData.edad || formData.edad < 16 || formData.edad > 100) {
      newErrors.edad = 'La edad debe estar entre 16 y 100 años';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmModalOpen(true);
    setPendingSubmit(true);
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    setConfirmModalOpen(false);
    setPendingSubmit(false);
    try {
      const registrosRaw = localStorage.getItem('eventRegistrations') || '[]';
      const registros = JSON.parse(registrosRaw);
      const yaRegistrado = registros.find(
        r => r.evento && r.evento.id === evento.id && r.userEmail === formData.email
      );
      if (yaRegistrado) {
        setErrors({ general: 'Ya estás registrado en este evento' });
        setIsSubmitting(false);
        return;
      }
      const nuevoRegistro = {
        id: `${evento.id}-${formData.email}-${Date.now()}`,
        evento: {
          id: evento.id,
          nombre: evento.nombre,
          fecha: evento.fecha,
          ubicacion: evento.ubicacion,
          lat: evento.lat,
          lng: evento.lng,
          estado: evento.estado,
          especies: evento.especies || [],
          arboles: evento.arboles || 0,
          voluntarios: evento.voluntarios || 0,
          descripcion: evento.descripcion || ''
        },
        userEmail: formData.email,
        userName: formData.nombre,
        telefono: formData.telefono,
        edad: Number.parseInt(formData.edad, 10),
        experiencia: formData.experiencia,
        disponibilidad: formData.disponibilidad,
        transporte: formData.transporte,
        comentarios: formData.comentarios,
        estado: 'confirmado',
        fechaRegistro: new Date().toISOString()
      };
      registros.push(nuevoRegistro);
      localStorage.setItem('eventRegistrations', JSON.stringify(registros));
      globalThis.window.dispatchEvent(new Event('registrationChange'));
      globalThis.window.dispatchEvent(new Event('storage'));
      setShowSuccess(true);
      try {
        globalThis.window.dispatchEvent(new CustomEvent('app:toast', {
          detail: {
            title: '¡Registro exitoso!',
            message: `Te has unido al proyecto "${evento.nombre}". Recibirás más información pronto.`
          }
        }));
      } catch (e) {
        console.error('Error showing toast:', e);
      }
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error al registrar:', error);
      setErrors({ general: 'Error al procesar el registro. Inténtalo de nuevo.' });
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFormData({
      nombre: user?.name || user?.username || '',
      email: user?.email || '',
      telefono: '',
      edad: '',
      experiencia: 'ninguna',
      disponibilidad: 'completo',
      transporte: 'propio',
      comentarios: ''
    });
    setErrors({});
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <ConfirmModal
        open={confirmModalOpen}
        title="Confirmar registro"
        message={`¿Estás seguro que deseas unirte al proyecto "${evento?.nombre}"?`}
        onConfirm={doSubmit}
        onCancel={() => { setConfirmModalOpen(false); setPendingSubmit(false); }}
      />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Únete al Proyecto
              </h2>
              <p className="text-green-100 text-sm font-medium">
                {evento.nombre}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
              <CheckCircle2 className="shrink-0" size={24} />
              <div>
                <p className="font-semibold">¡Registro exitoso!</p>
                <p className="text-sm">Te has unido al proyecto. Recibirás más información pronto.</p>
              </div>
            </div>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Información del Evento */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="text-green-600" size={18} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                <p className="font-medium">{evento.fecha}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-xl">🌳</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Árboles</p>
                <p className="font-medium">{evento.arboles?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline mr-2" size={16} />
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ej: Juan Pérez"
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline mr-2" size={16} />
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="ejemplo@correo.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Teléfono y Edad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline mr-2" size={16} />
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0987654321"
                disabled={isSubmitting}
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefono}</p>
              )}
            </div>

            <div>
              <label htmlFor="edad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edad *
              </label>
              <input
                id="edad"
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                min="16"
                max="100"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                  errors.edad ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="18"
                disabled={isSubmitting}
              />
              {errors.edad && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.edad}</p>
              )}
            </div>
          </div>

          {/* Experiencia */}
          <div>
            <label htmlFor="experiencia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experiencia en Reforestación *
            </label>
            <select
              id="experiencia"
              name="experiencia"
              value={formData.experiencia}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              disabled={isSubmitting}
            >
              <option value="ninguna">Ninguna - Es mi primera vez</option>
              <option value="basica">Básica - He participado 1-2 veces</option>
              <option value="intermedia">Intermedia - He participado 3-5 veces</option>
              <option value="avanzada">Avanzada - Participo regularmente</option>
            </select>
          </div>

          {/* Disponibilidad */}
          <div>
            <label htmlFor="disponibilidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Disponibilidad *
            </label>
            <select
              id="disponibilidad"
              name="disponibilidad"
              value={formData.disponibilidad}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              disabled={isSubmitting}
            >
              <option value="completo">Día completo</option>
              <option value="manana">Solo mañana</option>
              <option value="tarde">Solo tarde</option>
            </select>
          </div>

          {/* Transporte */}
          <div>
            <label htmlFor="transporte" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transporte *
            </label>
            <select
              id="transporte"
              name="transporte"
              value={formData.transporte}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              disabled={isSubmitting}
            >
              <option value="propio">Tengo transporte propio</option>
              <option value="publico">Usaré transporte público</option>
              <option value="compartido">Necesito transporte compartido</option>
              <option value="necesito">Necesito que me recojan</option>
            </select>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare className="inline mr-2" size={16} />
              Comentarios o Preguntas (Opcional)
            </label>
            <textarea
              name="comentarios"
              value={formData.comentarios}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
              placeholder="¿Tienes alguna pregunta o algo que compartir?"
              disabled={isSubmitting}
            />
          </div>

          {/* Nota informativa */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> Recibirás un correo de confirmación con los detalles del evento, 
              punto de encuentro y recomendaciones para el día de la reforestación.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                'Confirmar Registro'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
