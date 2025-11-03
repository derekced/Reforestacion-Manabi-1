import React from "react";
import RegisterForm from "@/components/formu/RegisterForm";

export const metadata = {
  title: "Registro - Reforesta Manabí",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/plant-watering-reforestation.jpg')`,
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/65"></div>
      </div>
      
      <main className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
