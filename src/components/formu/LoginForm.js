"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();

  // si ya hay usuario autenticado en localStorage/sessionStorage, redirigir
  React.useEffect(() => {
    try {
      const u = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
      if (u) router.push("/");
    } catch (e) {
      // ignore
    }
  }, [router]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);

  // Helpers for per-email attempts stored in localStorage under key 'loginAttempts'
  const readAttemptsMap = () => {
    try {
      return JSON.parse(localStorage.getItem("loginAttempts") || "{}");
    } catch (e) {
      return {};
    }
  };
  const writeAttemptsMap = (m) => {
    try {
      localStorage.setItem("loginAttempts", JSON.stringify(m));
    } catch (e) {}
  };
  const getAttemptsFor = (email) => {
    if (!email) return { count: 0, until: null };
    const m = readAttemptsMap();
    return m[email] || { count: 0, until: null };
  };
  const setAttemptsFor = (email, count, until = null) => {
    const m = readAttemptsMap();
    m[email] = { count, until };
    writeAttemptsMap(m);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Update attempts/lock when email changes
  React.useEffect(() => {
    if (!form.email) {
      setAttempts(0);
      setLockUntil(null);
      return;
    }
    const info = getAttemptsFor(form.email);
    setAttempts(info.count || 0);
    setLockUntil(info.until || null);
  }, [form.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // read per-email lock
    const info = getAttemptsFor(form.email);
    if (info && info.until && Date.now() < info.until) {
      setLockUntil(info.until);
      setAttempts(info.count || 0);
      setError(`${t('login.credencialesInvalidas')} - ${Math.ceil((info.until - Date.now())/1000)}s`);
      return;
    }
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
      // Credenciales de administrador
      const adminCredentials = {
        email: "admin@reforestacion.com",
        password: "admin123",
      };

      // Simulación de espera
      await new Promise((r) => setTimeout(r, 600));

      // Buscar en usuarios locales
      const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
      const matched = usuarios.find(u => u.email === form.email && u.password === form.password);

      const isAdmin = form.email === adminCredentials.email && form.password === adminCredentials.password;

      if (!matched && !isAdmin) {
        // credenciales invalidas
        throw new Error("Invalid credentials");
      }

      // Simular usuario autenticado: guarda en storage según "recordarme"
      const authUser = {
        name: isAdmin ? "Administrador" : (matched?.nombre || form.email.split("@")[0].replace(/\W/g, " ").trim() || "Usuario"),
        email: form.email,
        avatar: (matched && matched.avatar) || "/avatars/user.jpg",
        role: isAdmin ? "admin" : (matched?.role || "user"),
      };

      try {
        if (remember) {
          localStorage.setItem("authUser", JSON.stringify(authUser));
        } else {
          sessionStorage.setItem("authUser", JSON.stringify(authUser));
        }
      } catch (e) {
        // si falla localStorage, ignorar
      }

  // resetear intentos en exito (por email)
  setAttemptsFor(form.email, 0, null);
  setAttempts(0);
  setLockUntil(null);
  // show toast
  try { window.dispatchEvent(new CustomEvent('app:toast', { detail: { title: 'Bienvenido', message: 'Has iniciado sesión correctamente. ¡Gracias por ayudar al planeta!' } })); } catch(e) {}
  router.push("/");
    } catch (err) {
      // manejar intento fallido por email
      const current = getAttemptsFor(form.email);
      const nextCount = (current.count || 0) + 1;
      if (nextCount >= 3) {
        const until = Date.now() + 30 * 1000; // 30s bloqueo
        setAttemptsFor(form.email, nextCount, until);
        setLockUntil(until);
        setAttempts(nextCount);
        setError(t("login.credencialesInvalidas"));
      } else {
        setAttemptsFor(form.email, nextCount, null);
        setAttempts(nextCount);
        setError(t("login.credencialesInvalidas"));
      }
    }
    setLoading(false);
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

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input 
            type="checkbox" 
            checked={remember} 
            onChange={e => setRemember(e.target.checked)} 
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span>{t('login.recordarme')}</span>
        </label>
        <a 
          href="/recuperar" 
          className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
        >
          {t('login.olvidarContrasena')}
        </a>
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
        disabled={lockUntil && Date.now() < lockUntil || loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? t('login.iniciando') : t('login.iniciarSesion')}
      </button>

      {/* Sign up link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('login.noTienesCuenta')}{' '}
          <a 
            href="/register" 
            className="font-medium text-green-600 dark:text-green-400 hover:underline"
          >
            {t('login.registrate')}
          </a>
        </p>
      </div>
    </form>
  );
}