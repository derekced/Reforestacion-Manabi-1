"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserPlus, Mail, Lock, User, Phone, MapPin } from "lucide-react";

export default function RegisterForm({ onBack }) {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    ciudad: "",
    terminos: false,
    role: "user", // 'user' or 'volunteer'
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // si ya hay usuario autenticado, redirigir fuera de registro
  useEffect(() => {
    try {
      const u = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
      if (u) router.push('/');
    } catch (e) {
      // ignore
    }
  }, [router]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validaciones
    if (!form.nombre.trim()) {
      setError(t('register.nombreRequerido'));
      return;
    }
    if (!form.email) {
      setError(t('register.emailRequerido'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t('register.emailRequerido'));
      return;
    }
    if (!form.password) {
      setError(t('register.contrasenaRequerida'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('register.contrasenaRequerida'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('register.contrasenasNoCoinciden'));
      return;
    }
    if (!form.ciudad) {
      setError(t('register.ciudadRequerida'));
      return;
    }
    if (!form.terminos) {
      setError(t('register.aceptarTerminos'));
      return;
    }

    // role validation
    if (!['user','volunteer'].includes(form.role)) {
      setError('Rol inválido');
      return;
    }

    setLoading(true);
    
    try {
      // Simular registro (aquí iría tu API)
      await new Promise((r) => setTimeout(r, 1000));
      
      // Verificar si el email ya existe
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      if (usuarios.some(u => u.email === form.email)) {
        setError(t('register.emailYaRegistrado'));
        setLoading(false);
        return;
      }
      
      // Guardar usuario
      const nuevoUsuario = {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        ciudad: form.ciudad,
        role: form.role,
        password: form.password, // En producción, esto debe estar hasheado
        fechaRegistro: new Date().toISOString(),
      };
      
      usuarios.push(nuevoUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      
      setSuccess(true);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      setError('Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {t('register.registroExitoso')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Redirigiendo al inicio de sesión...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
          <UserPlus className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('register.titulo')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('register.subtitulo')}
        </p>
      </div>

      {/* Nombre completo */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          {t('register.nombreCompleto')}
        </span>
        <input
          name="nombre"
          type="text"
          placeholder="Juan Pérez"
          value={form.nombre}
          onChange={handleChange}
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </label>

      {/* Email */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {t('register.email')}
        </span>
        <input
          name="email"
          type="email"
          placeholder="ejemplo@dominio.com"
          value={form.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </label>

      {/* Password */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          {t('register.contrasena')}
        </span>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </label>

      {/* Confirm Password */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          {t('register.confirmarContrasena')}
        </span>
        <input
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </label>

      {/* Teléfono */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          {t('register.telefono')}
        </span>
        <input
          name="telefono"
          type="tel"
          placeholder="0999999999"
          value={form.telefono}
          onChange={handleChange}
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </label>

      {/* Ciudad */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {t('register.ciudad')}
        </span>
        <input
          name="ciudad"
          type="text"
          placeholder="Manta, Portoviejo, etc."
          value={form.ciudad}
          onChange={handleChange}
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </label>

      {/* Rol: Usuario o Voluntario */}
      <div className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">¿Te registras como:</span>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="role" value="user" checked={form.role === 'user'} onChange={handleChange} />
            <span className="text-sm">Usuario común</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="role" value="volunteer" checked={form.role === 'volunteer'} onChange={handleChange} />
            <span className="text-sm">Voluntariado</span>
          </label>
        </div>
      </div>

      {/* Términos */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input 
          name="terminos"
          type="checkbox" 
          checked={form.terminos}
          onChange={handleChange}
          className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('register.aceptoTerminos')}
        </span>
      </label>

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
        className="w-full py-3 px-4 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? t('register.creando') : t('register.crearCuenta')}
      </button>

      {/* Sign in link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('register.yaTienesCuenta')}{' '}
          <a 
            href="/login" 
            className="font-medium text-green-600 dark:text-green-400 hover:underline"
          >
            {t('register.iniciarSesion')}
          </a>
        </p>
      </div>
    </form>
  );
}
