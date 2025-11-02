"use client";
import PageContainer from '@/components/PageContainer';
import { useEffect, useState } from 'react';
import { Trees, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminPeticionesPage() {
  const { t } = useLanguage();
  const [peticiones, setPeticiones] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('peticionesProyectos') || '[]';
    setPeticiones(JSON.parse(raw));
  }, [refresh]);

  const aceptarPeticion = (peticion) => {
    // Crear proyecto en localStorage
    const proyectosRaw = localStorage.getItem('proyectos') || '[]';
    const proyectos = JSON.parse(proyectosRaw);
    proyectos.push({
      id: `p-${Date.now()}`,
      nombre: peticion.nombre,
      ubicacion: peticion.ubicacion,
      lat: peticion.lat,
      lng: peticion.lng,
      fecha: peticion.fecha,
      arboles: peticion.arboles,
      voluntarios: peticion.voluntarios,
      especies: peticion.especies,
      descripcion: peticion.descripcion,
      estado: 'Próximo',
    });
    localStorage.setItem('proyectos', JSON.stringify(proyectos));
    // Eliminar petición
    const nuevas = peticiones.filter(p => p.id !== peticion.id);
    localStorage.setItem('peticionesProyectos', JSON.stringify(nuevas));
    setRefresh(r => r + 1);
    window.dispatchEvent(new Event('projectsChange'));
  };

  const rechazarPeticion = (peticion) => {
    const nuevas = peticiones.filter(p => p.id !== peticion.id);
    localStorage.setItem('peticionesProyectos', JSON.stringify(nuevas));
    setRefresh(r => r + 1);
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
          <Trees size={32}/> {t('common.projectRequests')}
        </h1>
        {peticiones.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">{t('common.noPendingRequests')}</p>
        ) : (
          <div className="space-y-6">
            {peticiones.map(p => (
              <div key={p.id} className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">{p.nombre}</h2>
                <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>{t('admin.location')}:</strong> {p.ubicacion}</p>
                <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>{t('admin.date')}:</strong> {p.fecha}</p>
                <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>{t('admin.trees')}:</strong> {p.arboles}</p>
                <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>{t('admin.volunteers')}:</strong> {p.voluntarios}</p>
                <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>{t('admin.species')}:</strong> {p.especies}</p>
                <p className="mb-2 text-gray-700 dark:text-gray-300"><strong>{t('admin.description')}:</strong> {p.descripcion}</p>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => aceptarPeticion(p)} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"><CheckCircle size={18}/>{t('common.accept')}</button>
                  <button onClick={() => rechazarPeticion(p)} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"><XCircle size={18}/>{t('common.cancel')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
