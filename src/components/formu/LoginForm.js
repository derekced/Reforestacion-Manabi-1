"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn, Mail, Lock } from "lucide-react";
import { signIn, getCurrentUser } from "@/lib/supabase-v2";

export default function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();

  // Verificar si ya hay usuario autenticado con Supabase
  React.useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) router.push("/");
    };
    checkUser();
  }, [router]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación básica
    if (!form.email) {
      setError(t('login.emailRequerido'));
      setLoading(false);
      return;
    }
    if (!form.password) {
      setError(t('login.contrasenaRequerida'));
      setLoading(false);
      return;
    }

    try {
      // Intentar login con Supabase Auth
      const { data, error: signInError } = await signIn({
        email: form.email,
        password: form.password
      });

      if (signInError) {
        // Manejar errores específicos de Supabase
        if (signInError.message.includes('Invalid login credentials')) {
          setError(t('login.credencialesInvalidas'));
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu email antes de iniciar sesión');
        } else {
          setError(signInError.message || t('login.credencialesInvalidas'));
        }
        setLoading(false);
        return;
      }

      if (data && data.user) {
        // Obtener perfil completo del usuario
        const fullUser = await getCurrentUser();
        const userRole = fullUser?.profile?.role || fullUser?.user_metadata?.role || 'volunteer';
        
        // Guardar en localStorage para compatibilidad con páginas antiguas
        const userForStorage = {
          id: data.user.id, // UUID del usuario
          email: data.user.email,
          nombre: fullUser?.profile?.nombre || fullUser?.user_metadata?.nombre || data.user.email,
          role: userRole,
          avatar: fullUser?.profile?.avatar || '/avatars/user.jpg'
        };
        localStorage.setItem('authUser', JSON.stringify(userForStorage));
        
        // Login exitoso, mostrar toast y redirigir
        try { 
          window.dispatchEvent(new CustomEvent('app:toast', { 
            detail: { 
              title: 'Bienvenido', 
              message: 'Has iniciado sesión correctamente. ¡Gracias por ayudar al planeta!' 
            } 
          })); 
        } catch(e) {}
        
        router.push("/");
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError(t('login.credencialesInvalidas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
          <LogIn className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('login.titulo')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('login.subtitulo')}
        </p>
      </div>

      {/* Email */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {t('login.email')}
        </span>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          placeholder="ejemplo@dominio.com"
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          aria-invalid={!!error && !form.email}
        />
      </label>

      {/* Password */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          {t('login.contrasena')}
        </span>
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          placeholder="••••••••"
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          aria-invalid={!!error && !form.password}
        />
      </label>

      {/* Forgot password */}
      <div className="flex items-center justify-end mb-6">
        <button
          type="button"
          onClick={() => router.push('/recuperar')}
          className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
        >
          {t('login.olvidasteContrasena')}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{t('login.iniciandoSesion')}</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>{t('login.iniciarSesion')}</span>
          </>
        )}
      </button>

      {/* Sign up link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('login.noTienesCuenta')}{' '}
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            {t('login.registrate')}
          </button>
        </p>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <p className="text-xs text-green-800 dark:text-green-300 text-center">
          🌱 Al iniciar sesión, contribuyes a la reforestación de Manabí
        </p>
      </div>
    </form>
  );
}