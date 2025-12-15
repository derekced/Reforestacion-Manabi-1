"use client";

import React, { useState, useEffect } from "react";
import ProfileForm from "@/components/formu/ProfileForm";
import MisProyectos from "@/components/MisProyectos";
import AdminDashboard from "@/components/AdminDashboard";
import WidgetImpacto from "@/components/WidgetImpacto";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PageContainer } from "@/components/PageContainer";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCurrentUser } from "@/lib/supabase-v2";

function ProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) return;
        
        const userRole = userData.profile?.role || userData.user_metadata?.role || 'volunteer';
        setUser({
          email: userData.email,
          role: userRole,
          nombre: userData.profile?.nombre || userData.user_metadata?.nombre || userData.email
        });
      } catch (e) {
        console.error('Error loading user:', e);
      }
    };
    
    loadUser();
  }, []);
  
  return (
    <PageContainer>
      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-linear-to-r from-green-700 via-green-600 to-emerald-600 dark:from-green-400 dark:via-green-300 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
              {t('perfil.titulo')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('perfil.descripcion')}
            </p>
          </div>

          {/* Grid de 3 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Información del perfil */}
            <div className="lg:col-span-1 space-y-6">
              <ProfileForm />
              
              {/* Widget de impacto */}
              <WidgetImpacto />
            </div>

            {/* Columna derecha - Proyectos registrados o Dashboard Admin */}
            <div className="lg:col-span-2">
              {user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <MisProyectos />
              )}
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}

export default function ProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}