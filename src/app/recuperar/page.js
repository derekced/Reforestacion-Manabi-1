import React from "react";
import RecuperarForm from "@/components/formu/RecuperarForm";

export const metadata = {
  title: "Recuperar Contraseña - Reforesta Manabí",
};

export default function RecuperarPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/Blog_Alqueria_Sostenibilidad_reforestacion_d1f8f5ac3d.webp')`,
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
      </div>
      
      <main className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <RecuperarForm />
        </div>
      </main>
    </div>
  );
}
