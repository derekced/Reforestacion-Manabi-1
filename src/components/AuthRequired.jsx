"use client";

import { useRouter } from 'next/navigation';
import { Lock, LogIn, UserPlus, Trees } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AuthRequired() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Icono */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-lg">
                <Lock className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full shadow-lg">
                <Trees className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Autenticación Requerida
          </h2>

          {/* Descripción */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Para acceder a esta sección y contribuir a la reforestación de Manabí, necesitas iniciar sesión o crear una cuenta.
          </p>

          {/* Beneficios */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 mb-8">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              🌟 Con tu cuenta podrás:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Registrarte en proyectos de reforestación</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Seguir tu impacto ambiental personal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Ver estadísticas de tus contribuciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Conectar con otros voluntarios</span>
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" strokeWidth={2.5} />
              Iniciar Sesión
            </button>

            <button
              onClick={() => router.push('/register')}
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-4 px-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" strokeWidth={2.5} />
              Crear Cuenta Nueva
            </button>
          </div>

          {/* Mensaje adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Únete a nuestra comunidad de voluntarios comprometidos con el medio ambiente 🌱
            </p>
          </div>
        </div>

        {/* Info extra */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Tienes problemas para acceder?{' '}
            <button
              onClick={() => router.push('/recuperar')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Recuperar contraseña
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
