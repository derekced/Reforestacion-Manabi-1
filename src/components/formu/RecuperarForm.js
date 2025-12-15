"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { resetPassword } from "@/lib/supabase-v2";

export default function RecuperarForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación básica
    if (!email) {
      setError(t('recuperar.emailRequerido'));
      setLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('recuperar.emailRequerido'));
      setLoading(false);
      return;
    }

    try {
      // Enviar email de recuperación con Supabase
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message || 'Error al enviar el email de recuperación');
        setLoading(false);
        return;
      }
      
      // Email enviado exitosamente
      setSuccess(true);
    } catch (err) {
      console.error('Error en recuperación:', err);
      setError(t('recuperar.emailRequerido'));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            {t('recuperar.exitoTitulo')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('recuperar.exitoMensaje')}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full px-6 py-3 rounded-xl bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            {t('recuperar.volverLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-8 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Botón volver */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          {t('recuperar.volverLogin')}
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('recuperar.titulo')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('recuperar.subtitulo')}
        </p>
      </div>

      {/* Email input */}
      <label className="block mb-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {t('recuperar.email')}
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@dominio.com"
          className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          aria-invalid={!!error}
        />
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
        {loading ? t('recuperar.enviando') : t('recuperar.enviarInstrucciones')}
      </button>
    </form>
  );
}
