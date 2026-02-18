import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Unit = Database['public']['Tables']['units']['Row'];
type VehicleType = Database['public']['Tables']['vehicle_types']['Row'];

export default function VehiclesManager() {
  const [units, setUnits] = useState<(Unit & { vehicle_types: VehicleType })[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    vehicle_type_id: '',
    unit_number: '',
    plates: '',
    brand: '',
    model: '',
    year: '',
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unitsRes, typesRes] = await Promise.all([
        supabase
          .from('units')
          .select('*, vehicle_types(*)')
          .order('unit_number'),
        supabase
          .from('vehicle_types')
          .select('*')
          .order('name'),
      ]);

      if (unitsRes.data) setUnits(unitsRes.data as any);
      if (typesRes.data) setVehicleTypes(typesRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('units')
          .update(data)
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('Unidad actualizada exitosamente');
      } else {
        const { error } = await supabase.from('units').insert(data);

        if (error) throw error;
        setSuccess('Unidad creada exitosamente');
      }

      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la unidad');
    }
  };

  const handleEdit = (unit: Unit) => {
    setFormData({
      vehicle_type_id: unit.vehicle_type_id,
      unit_number: unit.unit_number,
      plates: unit.plates || '',
      brand: unit.brand || '',
      model: unit.model || '',
      year: unit.year?.toString() || '',
      active: unit.active,
    });
    setEditingId(unit.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta unidad?')) {
      return;
    }

    try {
      const { error } = await supabase.from('units').delete().eq('id', id);

      if (error) throw error;

      setSuccess('Unidad eliminada exitosamente');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la unidad');
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_type_id: '',
      unit_number: '',
      plates: '',
      brand: '',
      model: '',
      year: '',
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
        <h3 className="text-xl font-bold text-slate-900">Gestión de Unidades</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Unidad
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
            {editingId ? 'Editar Unidad' : 'Nueva Unidad'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de vehículo *
              </label>
              <select
                value={formData.vehicle_type_id}
                onChange={(e) => setFormData({ ...formData, vehicle_type_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Seleccionar</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de unidad *
              </label>
              <input
                type="text"
                value={formData.unit_number}
                onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Placas</label>
              <input
                type="text"
                value={formData.plates}
                onChange={(e) => setFormData({ ...formData, plates: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Marca</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Modelo</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Año</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Unidad</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Tipo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Placas</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Marca/Modelo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Estado</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No hay unidades registradas
                </td>
              </tr>
            ) : (
              units.map((unit) => (
                <tr key={unit.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-900">{unit.unit_number}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{unit.vehicle_types?.name || '-'}</td>
                  <td className="py-3 px-4 text-slate-700">{unit.plates || '-'}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {unit.brand && unit.model ? `${unit.brand} ${unit.model}` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        unit.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {unit.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}