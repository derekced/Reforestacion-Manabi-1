"use client";

import { useEffect, useState } from 'react';
import AuthRequired from './AuthRequired';
import { getCurrentUser } from '@/lib/supabase-v2';

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 ProtectedRoute: Iniciando verificación de acceso...');
      try {
        const user = await getCurrentUser();
        console.log('🔐 ProtectedRoute: Usuario obtenido:', user ? 'SÍ' : 'NO');
        setIsAuthorized(!!user);
      } catch (e) {
        console.error('🔐 ProtectedRoute: Error checking auth:', e);
        setIsAuthorized(false);
      } finally {
        console.log('🔐 ProtectedRoute: Verificación completada');
        setIsLoading(false);
      }
    };
    
    // Agregar timeout de seguridad
    const timeout = setTimeout(() => {
      console.warn('⚠️ ProtectedRoute: Timeout alcanzado, asumiendo no autorizado');
      setIsLoading(false);
      setIsAuthorized(false);
    }, 3000); // 3 segundos
    
    checkAuth().finally(() => clearTimeout(timeout));
    
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <AuthRequired />;
  }

  return <>{children}</>;
}
