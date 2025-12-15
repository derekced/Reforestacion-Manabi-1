"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, Phone, MapPin, Key } from "lucide-react";
import { signUp, getCurrentUser } from "@/lib/supabase-v2";

export default function AdminRegisterPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    ciudad: "",
    adminCode: "",
    terminos: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar si ya hay usuario autenticado
  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) router.push('/');
    };
    checkUser();
  }, [router]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validaciones
    if (!form.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email inválido');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!form.ciudad) {
      setError('La ciudad es requerida');
      return;
    }
    if (!form.adminCode) {
      setError('El código de administrador es requerido');
      return;
    }
    if (!form.terminos) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    // Verificar código admin (código secreto: ADMIN2025MANABI)
    if (form.adminCode !== 'ADMIN2025MANABI') {
      setError('❌ Código de administrador incorrecto');
      return;
    }

    setLoading(true);
    
    try {
      // Registrar usuario con rol de admin
      const { data, error: signUpError } = await signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nombre: form.nombre,
            telefono: form.telefono || null,
            ciudad: form.ciudad,
            role: 'admin', // Rol forzado a admin
          }
        }
      });
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Este email ya está registrado');
        } else if (signUpError.message.includes('Password should be')) {
          setError('La contraseña debe tener al menos 6 caracteres');
        } else {
          setError(signUpError.message || 'Error al crear la cuenta');
        }
        setLoading(false);
        return;
      }

      // Forzar actualización del rol a admin (por si el trigger falló)
      if (data?.user?.id) {
        try {
          const { updateUserProfile } = await import('@/lib/supabase-v2');
          await updateUserProfile(data.user.id, { role: 'admin' });
        } catch (updateError) {
          console.error('Error actualizando rol:', updateError);
          // No fallar el registro por esto
        }
      }
      
      // Registro exitoso
      setSuccess(true);
      
      // Mostrar mensaje
      try {
        window.dispatchEvent(new CustomEvent('app:toast', {
          detail: {
            title: '✅ Administrador creado',
            message: 'Revisa tu email para confirmar tu cuenta'
          }
        }));
      } catch(e) {}
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error al crear la cuenta de administrador');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Registro de Administrador
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            🔐 Solo personal autorizado
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                ¡Administrador creado!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Revisa tu email para confirmar tu cuenta
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Código de Administrador */}
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                <label className="block">
                  <span className="text-sm font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Código de Administrador *
                  </span>
                  <input
                    name="adminCode"
                    type="password"
                    placeholder="Ingresa el código secreto"
                    value={form.adminCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-red-300 dark:border-red-700 px-4 py-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    required
                  />
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Solo personal autorizado conoce este código
                  </p>
                </label>
              </div>

              {/* Nombre */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre completo *
                </span>
                <input
                  name="nombre"
                  type="text"
                  placeholder="Juan Pérez"
                  value={form.nombre}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </label>

              {/* Email */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </label>

              {/* Password */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contraseña *
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </label>

              {/* Confirm Password */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar contraseña *
                </span>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </label>

              {/* Teléfono */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </span>
                <input
                  name="telefono"
                  type="tel"
                  placeholder="0999999999"
                  value={form.telefono}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </label>

              {/* Ciudad */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ciudad *
                </span>
                <input
                  name="ciudad"
                  type="text"
                  placeholder="Manta, Portoviejo, etc."
                  value={form.ciudad}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </label>

              {/* Términos */}
              <label className="flex items-start gap-2 mb-6">
                <input 
                  name="terminos"
                  type="checkbox" 
                  checked={form.terminos}
                  onChange={handleChange}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  required
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Acepto los términos y condiciones y confirmo que soy personal autorizado
                </span>
              </label>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Crear cuenta de administrador
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
            ⚠️ Esta página es solo para personal autorizado. El acceso no autorizado puede resultar en acciones legales.
          </p>
        </div>
      </div>
    </div>
  );
}
