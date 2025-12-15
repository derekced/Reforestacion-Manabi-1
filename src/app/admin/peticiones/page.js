"use client";
import PageContainer from '@/components/PageContainer';
import { useEffect, useState } from 'react';
import { Trees, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPeticiones, updatePeticion, createProyecto, getCurrentUser } from '@/lib/supabase-v2';

export default function AdminPeticionesPage() {
  const { t } = useLanguage();
  const [peticiones, setPeticiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const cargarPeticiones = async () => {
      setLoading(true);
      try {
        // Cargar peticiones pendientes desde Supabase
        const { data, error } = await getPeticiones('pendiente');
        
        if (error) {
          console.error('Error al cargar peticiones:', error);
          // Fallback a localStorage si falla
          const raw = localStorage.getItem('peticionesProyectos') || '[]';
          setPeticiones(JSON.parse(raw));
        } else {
          console.log('✅ Peticiones cargadas:', data?.length || 0);
          setPeticiones(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback a localStorage
        const raw = localStorage.getItem('peticionesProyectos') || '[]';
        setPeticiones(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    };
    
    cargarPeticiones();
  }, [refresh]);

  const aceptarPeticion = async (peticion) => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id || user?.profile?.id;
      
      // 1. Crear proyecto en Supabase
      const { data: nuevoProyecto, error: proyectoError } = await createProyecto({
        nombre: peticion.nombre,
        ubicacion: peticion.ubicacion,
        descripcion: peticion.descripcion,
        lat: peticion.lat,
        lng: peticion.lng,
        fecha: peticion.fecha,
        arboles: peticion.arboles,
        voluntarios_esperados: peticion.voluntarios,
        especies: Array.isArray(peticion.especies) ? peticion.especies : peticion.especies.split(',').map(e => e.trim()),
        estado: 'Próximo',
        created_by: userId
      });
      
      if (proyectoError) {
        console.error('Error al crear proyecto:', proyectoError);
        alert('Error al crear el proyecto: ' + proyectoError.message);
        return;
      }
      
      // 2. Actualizar estado de la petición a 'aprobado'
      const { error: updateError } = await updatePeticion(peticion.id, {
        estado: 'aprobado',
        revisado_por: userId,
        fecha_revision: new Date().toISOString()
      });
      
      if (updateError) {
        console.error('Error al actualizar petición:', updateError);
      }
      
      console.log('✅ Proyecto creado y petición aprobada');
      setRefresh(r => r + 1);
      window.dispatchEvent(new Event('projectsChange'));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la petición');
    }
  };

  const rechazarPeticion = async (peticion) => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id || user?.profile?.id;
      
      // Actualizar estado a 'rechazado'
      const { error } = await updatePeticion(peticion.id, {
        estado: 'rechazado',
        revisado_por: userId,
        fecha_revision: new Date().toISOString()
      });
      
      if (error) {
        console.error('Error al rechazar petición:', error);
        alert('Error al rechazar la petición: ' + error.message);
        return;
      }
      
      console.log('✅ Petición rechazada');
      setRefresh(r => r + 1);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el rechazo');
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
          <Trees size={32}/> {t('common.projectRequests')}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : peticiones.length === 0 ? (
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
