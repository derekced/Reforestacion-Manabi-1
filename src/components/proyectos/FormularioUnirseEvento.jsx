"use client";

import { useState, useEffect } from 'react';
import { X, UserCircle2, Mail, Phone, CalendarDays, MessageSquare, AlertCircle, CheckCircle2, MoveLeft, CheckCheck, Sprout, Calendar } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrentUser, registrarEnEvento, verificarRegistro } from '@/lib/supabase-v2';

export default function FormularioUnirseEvento({ evento, isOpen, onClose }) {
  const { t } = useLanguage();
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
      const loadUser = async () => {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
            setFormData(prev => ({
              ...prev,
              nombre: userData.user_metadata?.nombre || userData.email?.split('@')[0] || '',
              email: userData.email || ''
            }));
          }
        } catch (e) {
          console.error('Error loading user:', e);
        }
      };
      loadUser();
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
      // Obtener usuario actual
      const user = await getCurrentUser();
      if (!user) {
        setErrors({ general: 'Debes iniciar sesión para registrarte' });
        setIsSubmitting(false);
        return;
      }

      const userId = user.id || user.profile?.id;
      if (!userId) {
        setErrors({ general: 'No se pudo obtener tu identificación de usuario' });
        setIsSubmitting(false);
        return;
      }

      console.log('🔍 Verificando registro para userId:', userId, 'proyectoId:', evento.id);
      
      // Verificar si ya está registrado
      const { data: yaRegistrado } = await verificarRegistro(userId, evento.id);
      
      if (yaRegistrado) {
        console.log('⚠️ Ya registrado en este proyecto:', yaRegistrado);
        setErrors({ general: 'Ya estás registrado en este evento' });
        setIsSubmitting(false);
        return;
      }
      
      console.log('✅ Permitiendo registro nuevo');
      
      // Registrar en Supabase
      const { error: registroError } = await registrarEnEvento({
        proyecto_id: evento.id,
        usuario_id: userId,
        user_email: user.email,
        user_name: formData.nombre || user.profile?.nombre || user.email,
        telefono: formData.telefono,
        edad: Number.parseInt(formData.edad, 10),
        experiencia: formData.experiencia,
        disponibilidad: formData.disponibilidad,
        transporte: formData.transporte,
        comentarios: formData.comentarios || null,
        estado: 'confirmado'
      });
      
      if (registroError) {
        console.error('❌ Error registrando:', registroError);
        setErrors({ general: registroError.message || 'Error al procesar el registro. Inténtalo de nuevo.' });
        setIsSubmitting(false);
        return;
      }
      
      console.log('✅ Registro exitoso en Supabase');
      
      // Registro exitoso
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
      
      // Disparar evento para actualizar UI
      globalThis.window.dispatchEvent(new Event('registrationChange'));
      
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
      nombre: user?.user_metadata?.nombre || user?.email?.split('@')[0] || '',
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
                {t('modal.registroProyecto')}
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

        {/* Success Message - Modal Mejorado */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 rounded-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 m-6 max-w-md w-full shadow-2xl border-2 border-green-500 animate-in fade-in zoom-in duration-300">
              {/* Icono de éxito animado */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 shadow-xl">
                    <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>
              
              {/* Título y mensaje */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ¡Registro Exitoso! 🎉
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Te has registrado exitosamente en <span className="font-semibold text-green-600 dark:text-green-400">{evento?.nombre}</span>
                </p>
                <div className="pt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Fecha: <strong>{evento?.fecha}</strong></span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{evento?.ubicacion}</span>
                  </p>
                </div>
                <div className="pt-2 text-xs text-gray-500 dark:text-gray-500 italic">
                  Recibirás un correo de confirmación pronto. ¡Gracias por tu compromiso con el planeta! 🌱
                </div>
              </div>
              
              {/* Botón de cerrar */}
              <button
                onClick={handleCloseModal}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Entendido
              </button>
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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                <p className="font-medium">{evento.fecha}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                <Sprout className="w-5 h-5 text-white" />
              </div>
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
              <UserCircle2 className="inline mr-2" size={16} />
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              <MoveLeft className="w-4 h-4" />
              {t('modal.volver')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('modal.registrando')}
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  {t('modal.confirmarRegistro')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
