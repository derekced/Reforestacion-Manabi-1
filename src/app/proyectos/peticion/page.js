"use client";
import PageContainer from '@/components/PageContainer';
import PeticionProyectoForm from '@/components/proyectos/PeticionProyectoForm';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PeticionProyectoPage() {
  const { t } = useLanguage();
  return (
    <PageContainer>
      <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-400">{t('admin.nuevoProyecto') || 'Solicitar creación de proyecto'}</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{t('admin.noHayProyectosDesc') || 'Llena el formulario para solicitar la creación de un nuevo proyecto de reforestación. El administrador revisará tu petición y te notificará cuando sea aceptada.'}</p>
        <PeticionProyectoForm />
      </div>
    </PageContainer>
  );
}
