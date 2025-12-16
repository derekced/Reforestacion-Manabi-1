"use client";

import { useState, useEffect } from 'react';
import { X, CreditCard, Plus, Check, Heart, DollarSign, Sparkles, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { crearDonacion, getCurrentUser, crearMetodoPago, obtenerMetodosPago, eliminarMetodoPago } from '@/lib/supabase-v2';

// Función para detectar el tipo de tarjeta por el número
const detectarTipoTarjeta = (numero) => {
  const numeroLimpio = numero.replace(/\s/g, '');
  
  if (/^4/.test(numeroLimpio)) return { tipo: 'Visa', color: 'bg-blue-600', icono: '💳' };
  if (/^5[1-5]/.test(numeroLimpio)) return { tipo: 'Mastercard', color: 'bg-orange-600', icono: '💳' };
  if (/^3[47]/.test(numeroLimpio)) return { tipo: 'American Express', color: 'bg-green-700', icono: '💳' };
  if (/^6(?:011|5)/.test(numeroLimpio)) return { tipo: 'Discover', color: 'bg-purple-600', icono: '💳' };
  
  return { tipo: 'Desconocida', color: 'bg-gray-600', icono: '💳' };
};

// Función para formatear el número de tarjeta
const formatearNumeroTarjeta = (numero) => {
  const limpio = numero.replace(/\s/g, '');
  const grupos = limpio.match(/.{1,4}/g);
  return grupos ? grupos.join(' ') : limpio;
};

export default function ModalDonacion({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [paso, setPaso] = useState(1); // 1: seleccionar/agregar tarjeta, 2: ingresar monto, 3: confirmación
  const [tarjetas, setTarjetas] = useState([]);
  const [agregarTarjeta, setAgregarTarjeta] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  const [monto, setMonto] = useState('');
  const [procesando, setProcesando] = useState(false);
  
  // Formulario de nueva tarjeta
  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  });

  // Cargar tarjetas guardadas desde la base de datos
  useEffect(() => {
    const cargarMetodosPago = async () => {
      if (isOpen) {
        const { data: metodosPago, error } = await obtenerMetodosPago();
        
        if (error) {
          console.error('Error al cargar métodos de pago:', error);
          // Fallback a localStorage si hay error
          const tarjetasGuardadas = localStorage.getItem('tarjetasGuardadas');
          if (tarjetasGuardadas) {
            setTarjetas(JSON.parse(tarjetasGuardadas));
          }
        } else if (metodosPago && metodosPago.length > 0) {
          // Convertir formato de BD a formato del componente
          const tarjetasFormateadas = metodosPago.map(mp => {
            const tipoTarjeta = detectarTipoTarjeta(mp.ultimos_4_digitos);
            return {
              id: mp.id,
              numero: `**** **** **** ${mp.ultimos_4_digitos}`,
              nombre: mp.nombre_titular,
              expiracion: mp.fecha_expiracion,
              ultimos4: mp.ultimos_4_digitos,
              tipo: mp.marca || tipoTarjeta.tipo,
              color: tipoTarjeta.color,
              icono: tipoTarjeta.icono,
              metodoPagoId: mp.id // ID de la BD
            };
          });
          setTarjetas(tarjetasFormateadas);
        }
        
        setPaso(1);
        setMonto('');
        setTarjetaSeleccionada(null);
        setAgregarTarjeta(false);
      }
    };

    cargarMetodosPago();
  }, [isOpen]);

  const guardarTarjeta = async () => {
    if (!nuevaTarjeta.numero || !nuevaTarjeta.nombre || !nuevaTarjeta.expiracion || !nuevaTarjeta.cvv) {
      alert(t('donacion.completarCampos'));
      return;
    }

    const tipoTarjeta = detectarTipoTarjeta(nuevaTarjeta.numero);
    const ultimos4 = nuevaTarjeta.numero.replace(/\s/g, '').slice(-4);
    
    // Guardar en la base de datos
    const metodoPagoData = {
      tipo: 'tarjeta_credito',
      ultimos_4_digitos: ultimos4,
      marca: tipoTarjeta.tipo,
      nombre_titular: nuevaTarjeta.nombre,
      fecha_expiracion: nuevaTarjeta.expiracion,
      es_predeterminado: tarjetas.length === 0 // Primera tarjeta es predeterminada
    };
    
    const { data: metodoPagoGuardado, error } = await crearMetodoPago(metodoPagoData);
    
    if (error) {
      console.error('Error al guardar método de pago:', error);
      alert('Error al guardar la tarjeta. Por favor intenta de nuevo.');
      return;
    }
    
    // Agregar a la lista local
    const tarjetaAGuardar = {
      id: metodoPagoGuardado.id,
      numero: nuevaTarjeta.numero,
      nombre: nuevaTarjeta.nombre,
      expiracion: nuevaTarjeta.expiracion,
      ultimos4: ultimos4,
      tipo: tipoTarjeta.tipo,
      color: tipoTarjeta.color,
      icono: tipoTarjeta.icono,
      metodoPagoId: metodoPagoGuardado.id
    };

    const nuevasTarjetas = [...tarjetas, tarjetaAGuardar];
    setTarjetas(nuevasTarjetas);
    
    setNuevaTarjeta({ numero: '', nombre: '', expiracion: '', cvv: '' });
    setAgregarTarjeta(false);
    
    // Notificación
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: {
        title: t('donacion.tarjetaGuardada'),
        message: t('donacion.tarjetaGuardadaMensaje')
      }
    }));
  };

  const eliminarTarjeta = async (tarjetaId, e) => {
    e.stopPropagation();
    
    if (!confirm(t('donacion.confirmarEliminarTarjeta'))) {
      return;
    }

    // Eliminar de la base de datos
    const { error } = await eliminarMetodoPago(tarjetaId);
    
    if (error) {
      console.error('Error al eliminar método de pago:', error);
      alert('Error al eliminar la tarjeta. Por favor intenta de nuevo.');
      return;
    }

    // Eliminar de la lista local
    const nuevasTarjetas = tarjetas.filter(t => t.id !== tarjetaId);
    setTarjetas(nuevasTarjetas);
    
    // Notificación
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: {
        title: t('donacion.tarjetaEliminada'),
        message: ''
      }
    }));
  };

  const seleccionarTarjeta = (tarjeta) => {
    setTarjetaSeleccionada(tarjeta);
    setPaso(2);
  };

  const procesarDonacion = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      alert(t('donacion.montoInvalido'));
      return;
    }

    setProcesando(true);
    
    try {
      // Obtener información del usuario actual
      const user = await getCurrentUser();
      
      console.log('👤 Usuario actual:', user);
      
      // Preparar datos de la donación
      const donacionData = {
        nombre_donante: user?.profile?.nombre || user?.email?.split('@')[0] || 'Anónimo',
        email_donante: user?.email || 'anonimo@ejemplo.com',
        telefono_donante: user?.profile?.telefono || null,
        tipo_donacion: 'unica',
        monto: parseFloat(monto),
        moneda: 'USD',
        proyecto_id: null, // Donación general
        metodo_pago_id: tarjetaSeleccionada.metodoPagoId || null, // Asociar método de pago
        es_anonimo: false,
        mensaje: `Donación realizada con ${tarjetaSeleccionada.tipo} terminada en ${tarjetaSeleccionada.ultimos4}`
      };
      
      console.log('💳 Datos de donación a guardar:', donacionData);
      
      // Guardar donación en la base de datos
      const { data: donacionGuardada, error } = await crearDonacion(donacionData);
      
      if (error) {
        console.error('❌ Error al guardar donación:', error);
        alert(`Error al procesar la donación: ${error.message || 'Error desconocido'}`);
        setProcesando(false);
        return;
      }
      
      console.log('✅ Donación guardada exitosamente en la BD:', donacionGuardada);
      
      setProcesando(false);
      setPaso(3);
      
      // Notificación de éxito
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: {
          title: t('donacion.donacionExitosa'),
          message: `${t('donacion.donacionExitosaMensaje')} $${monto}`
        }
      }));
    } catch (err) {
      console.error('Error procesando donación:', err);
      alert('Error al procesar la donación. Por favor intenta de nuevo.');
      setProcesando(false);
    }
  };

  const cerrarYReiniciar = () => {
    setPaso(1);
    setMonto('');
    setTarjetaSeleccionada(null);
    setAgregarTarjeta(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-white" fill="currentColor" />
            <h2 className="text-2xl font-bold text-white">{t('donacion.titulo')}</h2>
          </div>
          <button
            onClick={cerrarYReiniciar}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Paso 1: Seleccionar o agregar tarjeta */}
          {paso === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('donacion.paso1Titulo')}
                </p>
              </div>

              {/* Tarjetas guardadas */}
              {tarjetas.length > 0 && !agregarTarjeta && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    {t('donacion.metodosGuardados')}
                  </h3>
                  {tarjetas.map((tarjeta) => (
                    <div
                      key={tarjeta.id}
                      className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all group relative cursor-pointer"
                      onClick={() => seleccionarTarjeta(tarjeta)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${tarjeta.color} rounded-lg flex items-center justify-center text-2xl`}>
                            {tarjeta.icono}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {tarjeta.tipo} •••• {tarjeta.ultimos4}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {tarjeta.nombre}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => eliminarTarjeta(tarjeta.id, e)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title={t('donacion.eliminarTarjeta')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar tarjeta */}
              {agregarTarjeta && (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    {t('donacion.agregarNuevaTarjeta')}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('donacion.numeroTarjeta')}
                    </label>
                    <input
                      type="text"
                      maxLength="19"
                      value={formatearNumeroTarjeta(nuevaTarjeta.numero)}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                        if (valor.length <= 16) {
                          setNuevaTarjeta({ ...nuevaTarjeta, numero: formatearNumeroTarjeta(valor) });
                        }
                      }}
                      placeholder={t('donacion.numeroTarjetaPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {nuevaTarjeta.numero && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {t('donacion.tipo')}: <span className="font-semibold">{detectarTipoTarjeta(nuevaTarjeta.numero).tipo}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('donacion.nombreTitular')}
                    </label>
                    <input
                      type="text"
                      value={nuevaTarjeta.nombre}
                      onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, nombre: e.target.value.toUpperCase() })}
                      placeholder={t('donacion.nombreTitularPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('donacion.expiracion')}
                      </label>
                      <input
                        type="text"
                        maxLength="5"
                        value={nuevaTarjeta.expiracion}
                        onChange={(e) => {
                          let valor = e.target.value.replace(/\D/g, '');
                          if (valor.length >= 2) {
                            valor = valor.slice(0, 2) + '/' + valor.slice(2, 4);
                          }
                          setNuevaTarjeta({ ...nuevaTarjeta, expiracion: valor });
                        }}
                        placeholder={t('donacion.expiracionPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('donacion.cvv')}
                      </label>
                      <input
                        type="text"
                        maxLength="4"
                        value={nuevaTarjeta.cvv}
                        onChange={(e) => {
                          const valor = e.target.value.replace(/\D/g, '');
                          setNuevaTarjeta({ ...nuevaTarjeta, cvv: valor });
                        }}
                        placeholder={t('donacion.cvvPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={guardarTarjeta}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      {t('donacion.guardarTarjeta')}
                    </button>
                    <button
                      onClick={() => {
                        setAgregarTarjeta(false);
                        setNuevaTarjeta({ numero: '', nombre: '', expiracion: '', cvv: '' });
                      }}
                      className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {t('donacion.cancelar')}
                    </button>
                  </div>
                </div>
              )}

              {/* Botón para agregar tarjeta */}
              {!agregarTarjeta && (
                <button
                  onClick={() => setAgregarTarjeta(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">{t('donacion.agregarNuevaTarjeta')}</span>
                </button>
              )}
            </div>
          )}

          {/* Paso 2: Ingresar monto */}
          {paso === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('donacion.paso2Titulo')}
                </p>
              </div>

              {/* Monto */}
              <div className="space-y-4">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-14 pr-4 py-4 text-3xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-center"
                  />
                </div>

                {/* Montos sugeridos */}
                <div className="grid grid-cols-4 gap-3">
                  {[10, 25, 50, 100].map((cantidad) => (
                    <button
                      key={cantidad}
                      onClick={() => setMonto(cantidad.toString())}
                      className="py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all font-semibold text-gray-700 dark:text-gray-300"
                    >
                      ${cantidad}
                    </button>
                  ))}
                </div>
              </div>

              {/* Método de pago seleccionado */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('donacion.metodoPago')}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${tarjetaSeleccionada.color} rounded-lg flex items-center justify-center text-xl`}>
                    {tarjetaSeleccionada.icono}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {tarjetaSeleccionada.tipo} •••• {tarjetaSeleccionada.ultimos4}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaso(1)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {t('donacion.atras')}
                </button>
                <button
                  onClick={procesarDonacion}
                  disabled={procesando || !monto || parseFloat(monto) <= 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('donacion.procesando')}
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" fill="currentColor" />
                      {t('donacion.donarMonto')} ${monto || '0.00'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {paso === 3 && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {t('donacion.exitoTitulo')}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {t('donacion.exitoMensaje')} <span className="font-bold text-green-600 dark:text-green-400">${monto}</span>
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('donacion.exitoDescripcion')}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('donacion.metodoPago')} {tarjetaSeleccionada.tipo} •••• {tarjetaSeleccionada.ultimos4}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('donacion.fecha')}: {new Date().toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={cerrarYReiniciar}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('donacion.finalizar')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
