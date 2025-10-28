"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm({ onBack }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    perfil: "usuario",
    terminos: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // validaciones en vivo
  const isNameValid = form.nombre.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isPasswordValid = form.password.length >= 6;

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Si es invitado, no se requieren campos personales
    if (form.perfil !== "invitado" && (!form.nombre || !form.email || !form.password)) {
      setError("Completa todos los campos.");
      return;
    }
    if (!form.terminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }
    setLoading(true);
    // Simula registro (lógica con API)
    setTimeout(() => {
      setSuccess("Registro exitoso. Puedes iniciar sesión.");
      setLoading(false);
      // Reiniciar estado o redireccionar según lógica deseada
    }, 1000);
  };

  const router = useRouter();
  // si ya hay usuario autenticado, redirigir fuera de registro
  useEffect(() => {
    try {
      const u = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
      if (u) router.push('/');
    } catch (e) {
      // ignore
    }
  }, [router]);
  const handleBack = () => {
    if (typeof onBack === "function") return onBack();
    // default behavior: navigate to login
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <form onSubmit={handleSubmit} className="form-card max-w-md mx-auto p-6 bg-white/80 dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center text-foreground">Registrarse</h1>

        {/* Perfil: Usuario / Invitado */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, perfil: 'usuario' }))}
            className={`px-4 py-2 rounded font-medium transition-colors ${form.perfil === 'usuario' ? 'bg-green-700 text-white' : 'bg-white/60 dark:bg-gray-700 text-foreground'}`}>
            Modo usuario
          </button>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, perfil: 'invitado' }))}
            className={`px-4 py-2 rounded font-medium transition-colors ${form.perfil === 'invitado' ? 'bg-green-700 text-white' : 'bg-white/60 dark:bg-gray-700 text-foreground'}`}>
            Invitado
          </button>
        </div>

        {form.perfil === 'invitado' && (
          <div className="mb-4 text-center text-sm text-muted-foreground">
            Estás entrando como invitado. No es necesario completar el formulario.
          </div>
        )}

        <div className="space-y-4">
          {/* Mostrar campos sólo si no es invitado */}
          {form.perfil !== 'invitado' && (
            <>
              <label className="block mb-3">
                <span className="text-sm font-medium text-foreground">Nombre completo</span>
                <input
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={!isNameValid}
                />
                <div className="mt-1 text-xs">
                  {isNameValid ? <span className="text-green-600">✓ Nombre OK</span> : <span className="text-red-500">✕ requerido</span>}
                </div>
              </label>

              <label className="block mb-3">
                <span className="text-sm font-medium text-foreground">Correo electrónico</span>
                <input
                  name="email"
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={!isEmailValid && form.email.length>0}
                />
                <div className="mt-1 text-xs">
                  {form.email.length === 0 ? null : isEmailValid ? <span className="text-green-600">✓ email válido</span> : <span className="text-red-500">✕ email inválido</span>}
                </div>
              </label>

              <label className="block mb-3">
                <span className="text-sm font-medium text-foreground">Contraseña</span>
                <input
                  name="password"
                  type="password"
                  placeholder="Crea una contraseña"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={!isPasswordValid && form.password.length>0}
                />
                <div className="mt-1 text-xs">
                  {form.password.length === 0 ? <span className="text-muted-foreground">Mínimo 6 caracteres</span> : isPasswordValid ? <span className="text-green-600">✓ contraseña OK</span> : <span className="text-red-500">✕ demasiado corta</span>}
                </div>
              </label>
            </>
          )}

          <label className="flex items-center space-x-2">
            <input
              name="terminos"
              type="checkbox"
              checked={form.terminos}
              onChange={handleChange}
              className="rounded border-input text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-foreground">Acepto los términos y condiciones</span>
          </label>

          {error && <div className="form-error text-sm text-red-500 mb-2">{error}</div>}
          {success && <div className="form-success text-sm text-green-700 mb-2">{success}</div>}
        </div>

        <div className="mt-6 space-y-3">
          {form.perfil === 'invitado' ? (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded bg-green-700 text-white"
              >
                Continuar como invitado
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, perfil: 'usuario' }))}
                className="px-4 py-2 rounded bg-white/60 dark:bg-gray-700 text-foreground"
              >
                Registrarme como usuario
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-green-700 text-white"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded bg-white/60 dark:bg-gray-700 text-foreground"
              >
                Volver
              </button>
            </div>
          )}
        </div>

        {/* Texto de políticas parecido al diseño */}
        <div className="mt-4 text-center text-sm">
          <p className="text-xs text-forest-primary dark:text-green-300">
            Si continúas, aceptas los <a className="underline" href="#">Términos del servicio</a> y confirmas que has leído nuestra <a className="underline" href="#">Política de privacidad</a>.
          </p>
          <p className="text-xs mt-2">
            <a className="underline text-forest-primary dark:text-green-300" href="#">Aviso de recopilación de datos</a>
          </p>
        </div>
      </form>
    </div>
  );
}
