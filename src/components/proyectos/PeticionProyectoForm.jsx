import React, { useState } from "react";
import { Trees, MapPin, Calendar, Users, FileText } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

export default function PeticionProyectoForm({ onSubmit }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    lat: "",
    lng: "",
    fecha: "",
    arboles: "",
    voluntarios: "",
    especies: "",
    descripcion: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = t('admin.nombreProyecto') + ' ' + (t('admin.nombreProyectoPlaceholder') ? '' : 'requerido');
    if (!form.ubicacion.trim()) e.ubicacion = t('admin.ubicacion') + ' requerido';
    if (!form.lat || isNaN(Number(form.lat))) e.lat = t('admin.latitud') + ' válido requerido';
    if (!form.lng || isNaN(Number(form.lng))) e.lng = t('admin.longitud') + ' válido requerido';
    if (!form.fecha) e.fecha = t('admin.fechaEvento') + ' requerido';
    if (!form.arboles || isNaN(Number(form.arboles)) || Number(form.arboles) <= 0) e.arboles = t('admin.numeroArboles') + ' válido';
    if (!form.voluntarios || isNaN(Number(form.voluntarios)) || Number(form.voluntarios) <= 0) e.voluntarios = t('admin.voluntariosNecesarios') + ' válido';
    if (!form.especies.trim()) e.especies = t('admin.especies') + ' requeridas (separadas por coma)';
    if (!form.descripcion.trim()) e.descripcion = t('admin.descripcion') + ' requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: "" }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    // Guardar petición en localStorage
    const raw = localStorage.getItem("peticionesProyectos") || "[]";
    const arr = JSON.parse(raw);
    arr.push({ ...form, id: Date.now() });
    localStorage.setItem("peticionesProyectos", JSON.stringify(arr));
    setSuccess(true);
    if (onSubmit) onSubmit();
  };

  if (success) return (
    <div className="p-6 text-center">
      <Trees className="mx-auto mb-4 text-green-600" size={40} />
      <h2 className="text-2xl font-bold mb-2">{t('modal.registroExitoso') || '¡Petición enviada!'}</h2>
      <p className="text-gray-700">{t('admin.noHayProyectosDesc') || 'Tu solicitud será revisada por el administrador. Recibirás notificación cuando sea aceptada.'}</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6">
      <div>
        <label className="block font-medium mb-1">{t('admin.nombreProyecto')} *</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`} placeholder={t('admin.nombreProyectoPlaceholder') || 'Ej: Bosque Urbano Manta'} />
        {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">{t('admin.ubicacion')} *</label>
        <input name="ubicacion" value={form.ubicacion} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.ubicacion ? 'border-red-500' : 'border-gray-300'}`} placeholder={t('admin.ubicacion') || 'Ej: Manta'} />
        {errors.ubicacion && <p className="text-red-600 text-sm mt-1">{errors.ubicacion}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">{t('admin.latitud')} *</label>
          <input name="lat" value={form.lat} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.lat ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: -0.9537" />
          {errors.lat && <p className="text-red-600 text-sm mt-1">{errors.lat}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">{t('admin.longitud')} *</label>
          <input name="lng" value={form.lng} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.lng ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: -80.7089" />
          {errors.lng && <p className="text-red-600 text-sm mt-1">{errors.lng}</p>}
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">{t('admin.fechaEvento')} *</label>
        <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.fecha ? 'border-red-500' : 'border-gray-300'}`} />
        {errors.fecha && <p className="text-red-600 text-sm mt-1">{errors.fecha}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">{t('admin.numeroArboles')} *</label>
          <input name="arboles" value={form.arboles} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.arboles ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: 1200" />
          {errors.arboles && <p className="text-red-600 text-sm mt-1">{errors.arboles}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">{t('admin.voluntariosNecesarios')} *</label>
          <input name="voluntarios" value={form.voluntarios} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.voluntarios ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: 80" />
          {errors.voluntarios && <p className="text-red-600 text-sm mt-1">{errors.voluntarios}</p>}
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">{t('admin.especies')} *</label>
        <input name="especies" value={form.especies} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.especies ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ej: Neem, Almendro, Laurel" />
        {errors.especies && <p className="text-red-600 text-sm mt-1">{errors.especies}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">{t('admin.descripcion')} *</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className={`w-full px-4 py-2 border rounded-lg ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`} placeholder={t('admin.descripcionPlaceholder') || 'Describe el objetivo y actividades del proyecto'} />
        {errors.descripcion && <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>}
      </div>
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 mt-2">
        <strong>Ayuda:</strong> Puedes obtener latitud y longitud desde Google Maps. Escribe una descripción clara para facilitar la aprobación.
      </div>
      <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg mt-4 transition-colors">{t('admin.crearProyecto') || 'Enviar Petición'}</button>
    </form>
  );
}
