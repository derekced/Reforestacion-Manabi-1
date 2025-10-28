"use client";

import { useEffect, useState } from 'react';
import AuthRequired from './AuthRequired';

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const authUser = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
      
      if (!authUser) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
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
