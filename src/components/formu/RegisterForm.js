"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm({ onBack }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    terminos: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.nombre || !form.email || !form.password || !form.perfil) {
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
  const handleBack = () => {
    if (typeof onBack === "function") return onBack();
    // default behavior: navigate to login
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <form className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground">Registrarse</h1>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Nombre completo</span>
            <input
              name="nombre"
              type="text"
              placeholder="Tu nombre completo"
              value={form.nombre}
              onChange={handleChange}
              autoComplete="name"
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Correo electrónico</span>
            <input
              name="email"
              type="email"
              placeholder="ejemplo@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Contraseña</span>
            <input
              name="password"
              type="password"
              placeholder="Crea una contraseña"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
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
          {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}
          {success && <div className="p-3 rounded-md bg-primary/10 text-primary text-sm">{success}</div>}
        </div>
        <div className="mt-6 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="w-full py-2 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Volver
          </button>
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <button type="button" className="btn-ghost" onClick={handleBack}>
          Volver
        </button>
      </form>
      <style jsx>{`
        .access-entry-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f6f8f7;
        }
        .access-card {
          background: #fff;
          border-radius: 1.2rem;
          padding: 2.2rem 2rem 2.5rem 2rem;
          box-shadow: 0 3px 18px rgba(30, 50, 52, 0.10);
          width: 340px;
          display: flex;
          flex-direction: column;
        }
        label {
          color: #375b49;
          font-size: 1rem;
          margin-top: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .terms-label {
          font-size: 0.97rem;
          flex-direction: row;
          gap: 0.7rem;
          align-items: center;
        }
        input, select {
          padding: 0.7rem;
          border-radius: 0.55rem;
          border: 1.3px solid #cbe7db;
          font-size: 1rem;
          margin-top: 0.1rem;
          background: #f3f7f4;
        }
        .form-error {
          color: #b23a3a;
          background: #ffeaea;
          margin-top: 1rem;
          border-radius: 7px;
          padding: 0.6rem;
        }
        .form-success {
          color: #1a693e;
          background: #dbffe6;
          margin-top: 1rem;
          border-radius: 7px;
          padding: 0.6rem;
        }
        .btn-primary {
          background: #1a693e;
          color: #fff;
          margin-top: 1.7rem;
          margin-bottom: 0.6rem;
          font-weight: 700;
          padding: 0.85rem;
          border-radius: 0.8rem;
          border: none;
          font-size: 1.1rem;
        }
        .btn-ghost {
          background: none;
          color: #1a693e;
          border: 1.5px solid #b7dbc4;
          padding: 0.8rem;
          border-radius: 0.8rem;
          font-weight: 600;
          font-size: 1.05rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
