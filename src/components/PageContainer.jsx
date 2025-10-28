"use client";

import Image from 'next/image';

export function PageContainer({ children }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background image with overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/Blog_Alqueria_Sostenibilidad_reforestacion_d1f8f5ac3d.webp"
          alt="Reforestation background"
          fill
          className="object-cover"
          priority
        />
        {/* Theme-based overlay */}
        <div className="absolute inset-0 bg-forest-primary/20 dark:bg-blue-950/40 mix-blend-multiply" />
      </div>
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}