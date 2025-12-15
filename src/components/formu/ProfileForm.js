"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCurrentUser, updateUserProfile, updatePassword } from "@/lib/supabase-v2";

export default function ProfileForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    newPassword: "",
    // campos adicionales para organizadores
    role: "volunteer",
    organizationName: "",
    organizationWebsite: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar datos del usuario desde Supabase
  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      setForm(f => ({
        ...f,
        nombre: user.user_metadata?.nombre || user.email?.split('@')[0] || "",
        email: user.email || "",
        role: user.user_metadata?.role || "volunteer",
        organizationName: user.user_metadata?.organizationName || "",
        organizationWebsite: user.user_metadata?.organizationWebsite || "",
      }));
    };
    loadUser();
  }, [router]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // validaciones en vivo
  const isNameValid = form.nombre.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isNewPasswordValid = !form.newPassword || form.newPassword.length >= 6;

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isNameValid || !isEmailValid || !isNewPasswordValid) {
      setError(t('profile.validateFields'));
      return;
    }

    if (form.newPassword && !form.password) {
      setError(t('profile.enterCurrentPassword'));
      return;
    }

    setLoading(true);
    try {
      // Actualizar perfil en Supabase
      const { error: updateError } = await updateUserProfile({
        nombre: form.nombre,
        telefono: null, // mantener teléfono existente
        ciudad: null, // mantener ciudad existente
        organizationName: form.organizationName || null,
        organizationWebsite: form.organizationWebsite || null,
      });
      
      if (updateError) {
        setError(updateError.message || "Error al actualizar el perfil");
        setLoading(false);
        return;
      }
      
      // Si hay nueva contraseña, actualizarla
      if (form.newPassword) {
        const { error: passwordError } = await updatePassword(form.newPassword);
        if (passwordError) {
          setError(passwordError.message || "Error al actualizar la contraseña");
          setLoading(false);
          return;
        }
        setSuccess(t('profile.updatePasswordSuccess'));
      } else {
        setSuccess(t('profile.updateSuccess'));
      }
      
      // Limpiar campos de contraseña
      setForm(f => ({ ...f, password: "", newPassword: "" }));
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError("Error al actualizar el perfil");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form-card max-w-md mx-auto p-6 bg-white/80 dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{t('profile.editProfile')}</h2>
      
      <div className="space-y-4">
        <label className="block mb-3">
          <span className="text-sm font-medium text-foreground">{t('profile.fullName')}</span>
          <input
            name="nombre"
            type="text"
            placeholder={t('profile.fullNamePlaceholder')}
            value={form.nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!isNameValid}
          />
          <div className="mt-1 text-xs">
            {!isNameValid && <span className="text-red-500">{t('profile.nameRequired')}</span>}
          </div>
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium text-foreground">{t('profile.email')}</span>
          <input
            name="email"
            type="email"
            placeholder={t('profile.emailPlaceholder')}
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!isEmailValid}
          />
          <div className="mt-1 text-xs">
            {!isEmailValid && form.email && <span className="text-red-500">{t('profile.invalidEmail')}</span>}
          </div>
        </label>

        {/* Mostrar rol (solo lectura) */}
        <div className="mb-3">
          <span className="text-sm font-medium text-foreground">{t('profile.role')}</span>
          <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{form.role}</div>
        </div>

        {/* Campos extra para organizadores */}
        {form.role === 'organizer' && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium mb-3">{t('profile.organization')}</h3>
            <label className="block mb-3">
              <span className="text-sm font-medium text-foreground">{t('profile.orgName')}</span>
              <input
                name="organizationName"
                type="text"
                placeholder={t('profile.orgNamePlaceholder')}
                value={form.organizationName}
                onChange={handleChange}
                className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-foreground">{t('profile.website')}</span>
              <input
                name="organizationWebsite"
                type="url"
                placeholder={t('profile.websitePlaceholder')}
                value={form.organizationWebsite}
                onChange={handleChange}
                className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium mb-3">{t('profile.changePassword')}</h3>
          
          <label className="block mb-3">
            <span className="text-sm font-medium text-foreground">{t('profile.currentPassword')}</span>
            <input
              name="password"
              type="password"
              placeholder={t('profile.currentPasswordPlaceholder')}
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block mb-3">
            <span className="text-sm font-medium text-foreground">{t('profile.newPassword')}</span>
            <input
              name="newPassword"
              type="password"
              placeholder={t('profile.newPasswordPlaceholder')}
              value={form.newPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!isNewPasswordValid}
            />
            <div className="mt-1 text-xs">
              {form.newPassword && !isNewPasswordValid && <span className="text-red-500">{t('profile.minChars')}</span>}
            </div>
          </label>
        </div>
      </div>

      {error && <div className="mt-4 p-3 rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      {success && <div className="mt-4 p-3 rounded bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">{success}</div>}

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-green-700 text-white"
        >
          {loading ? t('common.saving') : t('profile.saveChanges')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded bg-white/60 dark:bg-gray-700 text-foreground"
        >
          {t('profile.cancel')}
        </button>
      </div>
    </form>
  );
}