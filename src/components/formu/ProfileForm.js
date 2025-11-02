"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

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

  // Cargar datos del usuario al montar
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("authUser") || sessionStorage.getItem("authUser"));
      if (!user) {
        router.push("/login");
        return;
      }
      setForm(f => ({
        ...f,
        nombre: user.name || "",
        email: user.email || "",
        role: user.role || "volunteer",
        organizationName: user.organizationName || "",
        organizationWebsite: user.organizationWebsite || "",
      }));
    } catch (e) {
      router.push("/login");
    }
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
      // Simular actualización (aquí irá tu lógica de API)
      await new Promise(r => setTimeout(r, 600));
      
      // Actualizar storage
      const storage = localStorage.getItem("authUser") ? localStorage : sessionStorage;
      const updatedUser = {
        name: form.nombre,
        email: form.email,
        avatar: "/avatars/user.jpg", // mantener avatar existente o usar uno por defecto
        role: form.role || 'volunteer',
        organizationName: form.organizationName || undefined,
        organizationWebsite: form.organizationWebsite || undefined,
      };
      storage.setItem("authUser", JSON.stringify(updatedUser));
      // También persistir en la lista global de usuarios si existe
      try {
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const idx = usuarios.findIndex(u => u.email === form.email);
        if (idx > -1) {
          usuarios[idx] = { ...usuarios[idx], nombre: form.nombre, role: form.role, organizationName: form.organizationName, organizationWebsite: form.organizationWebsite };
        } else {
          usuarios.push({ nombre: form.nombre, email: form.email, role: form.role, organizationName: form.organizationName, organizationWebsite: form.organizationWebsite });
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
      } catch(e) {}
      
      setSuccess(t('profile.updateSuccess'));
      if (form.newPassword) {
        setSuccess(t('profile.updatePasswordSuccess'));
      }
      // Limpiar campos de contraseña
      setForm(f => ({ ...f, password: "", newPassword: "" }));
    } catch (err) {
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