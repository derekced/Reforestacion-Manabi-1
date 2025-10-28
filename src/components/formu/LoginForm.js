"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // bloqueo temporal si excedió intentos
    if (lockUntil && Date.now() < lockUntil) {
      setError(`Demasiados intentos. Intenta nuevamente en ${Math.ceil((lockUntil - Date.now())/1000)}s`);
      return;
    }
    setLoading(true);
    setError("");
    // Validación básica
    if (!form.email || !form.password) {
      setError("Completa ambos campos.");
      setLoading(false);
      return;
    }
    try {
      // Aquí puedes llamar a tu API de autenticación.
      // Simulación de espera
      await new Promise((r) => setTimeout(r, 600));
      // Simular usuario autenticado: guarda en storage según "recordarme"
      const authUser = {
        name: form.email.split("@")[0].replace(/\W/g, " ").trim() || "Usuario",
        email: form.email,
        avatar: "/avatars/user.jpg",
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
      // redirigir a la página principal
      // resetear intentos en exito
      setAttempts(0);
      setLockUntil(null);
      router.push("/");
    } catch (err) {
      // manejar intento fallido
      setAttempts(a => {
        const next = a + 1;
        if (next >= 3) {
          const until = Date.now() + 30000; // 30s bloqueo
          setLockUntil(until);
          setError('Demasiados intentos. Bloqueado por 30s.');
        } else {
          setError("Acceso inválido");
        }
        return next;
      });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form-card max-w-md mx-auto p-6 bg-white/80 dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Acceso al Sistema</h2>
      <label className="block mb-3">
        <span className="text-sm">Correo electrónico</span>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          placeholder="ejemplo@dominio.com"
          className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-invalid={!!error && !form.email}
        />
      </label>
      <label className="block mb-3">
        <span className="text-sm">Contraseña</span>
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          placeholder="****"
          className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-invalid={!!error && !form.password}
        />
      </label>
      <label className="flex items-center gap-2 mb-3 text-sm">
        <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded border-input" />
        <span>Recordarme</span>
      </label>
      {error && <div className="form-error text-sm text-red-500 mb-2">{error}</div>}
      <div className="flex items-center justify-between gap-4">
        <button type="submit" disabled={lockUntil && Date.now() < lockUntil} className="px-4 py-2 rounded bg-green-700 text-white">
          {loading ? "Cargando..." : "Ingresar"}
        </button>
        <div className="flex flex-col text-sm">
          <a href="/recuperar" className="text-forest-primary dark:text-green-300">¿Olvidaste tu contraseña?</a>
          <a href="/register" className="text-forest-primary dark:text-green-300 mt-1">¿No tienes cuenta? Regístrate</a>
        </div>
      </div>
    </form>
  );
}