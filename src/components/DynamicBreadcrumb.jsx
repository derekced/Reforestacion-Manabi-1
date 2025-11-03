"use client";

import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Mapeo de rutas a nombres de sección
  const routeMap = {
    '/': t('sidebar.inicio'),
    '/admin': t('sidebar.admin'),
    '/admin/peticiones': t('common.projectRequests'),
    '/proyectos': t('sidebar.proyectos'),
    '/proyectos/peticion': t('proyectos.nuevaPeticion'),
    '/organizer': t('sidebar.organizer'),
    '/profile': t('sidebar.perfil'),
    '/control': t('sidebar.control'),
    '/estadisticas': t('sidebar.estadisticas'),
    '/voluntarios': t('sidebar.voluntarios'),
    '/login': 'Login',
    '/register': 'Registro',
    '/recuperar': 'Recuperar Contraseña'
  };

  // Obtener el nombre de la sección actual
  const currentSection = routeMap[pathname] || t('sidebar.inicio');

  return (
    <Breadcrumb className="overflow-hidden">
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/" className="hover:text-green-600 transition-colors">
            Reforesta Manabí
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold text-green-700">
            {currentSection}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
