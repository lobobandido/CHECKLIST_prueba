import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Check, MoveUp, MoveDown } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type InspectionPart = Database['public']['Tables']['inspection_parts']['Row'];

export default function InspectionPartsManager() {
  const [parts, setParts] = useState<InspectionPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inspection_parts')
        .select('*')
        .order('display_order');

      if (error) throw error;
      if (data) setParts(data);
    } catch (err) {
      setError('Error al cargar las partes de inspección');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('inspection_parts')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('Parte de inspección actualizada exitosamente');
      } else {
        const maxOrder = Math.max(...parts.map((p) => p.display_order), 0);
        const { error } = await supabase.from('inspection_parts').insert({
          ...formData,
          display_order: maxOrder + 1,
        });

        if (error) throw error;
        setSuccess('Parte de inspección creada exitosamente');
      }

      resetForm();
      loadParts();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la parte de inspección');
    }
  };

  const handleEdit = (part: InspectionPart) => {
    setFormData({
      name: part.name,
      description: part.description || '',
      active: part.active,
    });
    setEditingId(part.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta parte de inspección?')) {
      return;
    }

    try {
      const { error } = await supabase.from('inspection_parts').delete().eq('id', id);

      if (error) throw error;

      setSuccess('Parte de inspección eliminada exitosamente');
      loadParts();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la parte de inspección');
    }
  };

  const handleMoveUp = async (part: InspectionPart, index: number) => {
    if (index === 0) return;

    const prevPart = parts[index - 1];

    try {
      await Promise.all([
        supabase
          .from('inspection_parts')
          .update({ display_order: prevPart.display_order })
          .eq('id', part.id),
        supabase
          .from('inspection_parts')
          .update({ display_order: part.display_order })
          .eq('id', prevPart.id),
      ]);

      loadParts();
    } catch (err: any) {
      setError(err.message || 'Error al reordenar');
    }
  };

  const handleMoveDown = async (part: InspectionPart, index: number) => {
    if (index === parts.length - 1) return;

    const nextPart = parts[index + 1];

    try {
      await Promise.all([
        supabase
          .from('inspection_parts')
          .update({ display_order: nextPart.display_order })
          .eq('id', part.id),
        supabase
          .from('inspection_parts')
          .update({ display_order: part.display_order })
          .eq('id', nextPart.id),
      ]);

      loadParts();
    } catch (err: any) {
      setError(err.message || 'Error al reordenar');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Gestión de Partes de Inspección</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Parte
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-4">
            {editingId ? 'Editar Parte de Inspección' : 'Nueva Parte de Inspección'}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="active" className="text-sm text-slate-700">
                Activo
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {parts.map((part, index) => (
          <div
            key={part.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMoveUp(part, index)}
                  disabled={index === 0}
                  className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(part, index)}
                  disabled={index === parts.length - 1}
                  className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 font-mono">#{part.display_order}</span>
                  <h4 className="font-semibold text-slate-900">{part.name}</h4>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      part.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {part.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {part.description && (
                  <p className="text-sm text-slate-600 mt-1">{part.description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(part)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(part.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
