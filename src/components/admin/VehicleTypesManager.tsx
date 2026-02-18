import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type VehicleType = Database['public']['Tables']['vehicle_types']['Row'];

export default function VehicleTypesManager() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const loadVehicleTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) setVehicleTypes(data);
    } catch (err) {
      setError('Error al cargar los tipos de vehículo');
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
          .from('vehicle_types')
          .update({ name: formData.name })
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('Tipo de vehículo actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('vehicle_types')
          .insert({ name: formData.name });

        if (error) throw error;
        setSuccess('Tipo de vehículo creado exitosamente');
      }

      resetForm();
      loadVehicleTypes();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el tipo de vehículo');
    }
  };

  const handleEdit = (type: VehicleType) => {
    setFormData({
      name: type.name,
    });
    setEditingId(type.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tipo de vehículo?')) {
      return;
    }

    try {
      const { error } = await supabase.from('vehicle_types').delete().eq('id', id);

      if (error) throw error;

      setSuccess('Tipo de vehículo eliminado exitosamente');
      loadVehicleTypes();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el tipo de vehículo');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
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
        <h3 className="text-xl font-bold text-slate-900">Gestión de Tipos de Vehículo</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Tipo
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
            {editingId ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Tractocamión, Caja seca, Dolly"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
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
        {vehicleTypes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No hay tipos de vehículo registrados
          </div>
        ) : (
          vehicleTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{type.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Creado: {new Date(type.created_at).toLocaleDateString('es-MX')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(type)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(type.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}