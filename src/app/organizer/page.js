"use client";

import { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { Edit, Trash2, X, Save } from 'lucide-react';
import { cargarProyectos } from '@/lib/proyectosUtils';

function OrganizerPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    try {
      const authRaw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
      if (!authRaw) return;
      const u = JSON.parse(authRaw);
      setUser(u);

      const all = cargarProyectos();
      // Si es admin, mostrar todos; si es organizer, sólo los asignados
      const visible = u.role === 'admin' ? all : all.filter(p => Array.isArray(p.organizers) && p.organizers.includes(u.email));
      setProjects(visible);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      try {
        const all = cargarProyectos();
        const visible = user?.role === 'admin' ? all : all.filter(p => Array.isArray(p.organizers) && p.organizers.includes(user?.email));
        setProjects(visible);
      } catch (e) {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [user]);

  const openEdit = (project) => {
    setEditing(project);
    setForm({ ...project });
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({});
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const saveEdit = (e) => {
    e.preventDefault();
    try {
      const all = cargarProyectos();
      const updated = all.map(p => p.id === editing.id ? { ...p, ...form } : p);
      // Guardar con conversión de estado a inglés
      const proyectosParaGuardar = updated.map(p => ({
        ...p,
        estado: p.estado === 'Próximo' ? 'upcoming' : p.estado === 'Activo' ? 'in_progress' : p.estado === 'Completado' ? 'completed' : p.estado
      }));
      localStorage.setItem('proyectos', JSON.stringify(proyectosParaGuardar));
      window.dispatchEvent(new Event('projectsChange'));
      setProjects(updated.filter(p => user.role === 'admin' ? true : (Array.isArray(p.organizers) && p.organizers.includes(user.email))));
      closeEdit();
    } catch (e) {
      console.error('Error saving project:', e);
    }
  };

  const handleDelete = (id) => {
    if (!confirm(t('admin.confirmarEliminar'))) return;
    try {
      const all = cargarProyectos();
      const updated = all.filter(p => p.id !== id);
      // Guardar con conversión de estado a inglés
      const proyectosParaGuardar = updated.map(p => ({
        ...p,
        estado: p.estado === 'Próximo' ? 'upcoming' : p.estado === 'Activo' ? 'in_progress' : p.estado === 'Completado' ? 'completed' : p.estado
      }));
      localStorage.setItem('proyectos', JSON.stringify(proyectosParaGuardar));
      window.dispatchEvent(new Event('projectsChange'));
      setProjects(updated.filter(p => user.role === 'admin' ? true : (Array.isArray(p.organizers) && p.organizers.includes(user.email))));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('admin.nuevoProyecto')}</h1>
          <p className="text-sm text-gray-600">{user?.role === 'admin' ? t('userMenu.adminVerTodo') : t('userMenu.proyectosAsignados')}</p>
        </div>

        <div className="grid gap-4">
          {projects.length === 0 ? (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg text-center">No tienes proyectos asignados.</div>
          ) : (
            projects.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{p.nombre}</h3>
                  <p className="text-sm text-gray-500">{p.ubicacion} • {p.fecha}</p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{p.descripcion}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEdit(p)} className="px-3 py-2 bg-yellow-400 rounded-lg">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-2 bg-red-500 rounded-lg text-white">Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Editar Proyecto</h2>
                <button onClick={closeEdit} className="p-2"><X /></button>
              </div>
              <form onSubmit={saveEdit} className="space-y-3">
                <div>
                  <label className="text-sm">Nombre</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input name="arboles" type="number" value={form.arboles} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm">Descripción</label>
                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={closeEdit} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function OrganizerWrapper() {
  return (
    <ProtectedRoute>
      <OrganizerPage />
    </ProtectedRoute>
  );
}

export default OrganizerWrapper;
