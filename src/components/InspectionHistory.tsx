import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Download, Eye, Trash2, Loader2, FileText, Calendar, Truck as TruckIcon } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Inspection = Database['public']['Tables']['inspections']['Row'];

interface InspectionWithDetails extends Inspection {
  units: {
    unit_number: string;
    plates: string | null;
    brand: string | null;
    model: string | null;
    vehicle_types: {
      name: string;
    };
  };
  inspector: {
    full_name: string;
    email: string;
  };
  driver: {
    full_name: string;
    email: string;
  } | null;
}

export default function InspectionHistory() {
  const { profile } = useAuth();
  const [inspections, setInspections] = useState<InspectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'departure' | 'return'>('all');
  const [selectedInspection, setSelectedInspection] = useState<InspectionWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadInspections();
  }, [filterType]);

  const loadInspections = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('inspections')
        .select(`
          *,
          units!inner(
            unit_number,
            plates,
            brand,
            model,
            vehicle_types!inner(name)
          ),
          inspector:profiles!inspections_inspector_id_fkey(full_name, email),
          driver:profiles!inspections_driver_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('inspection_type', filterType);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInspections(data as any);
    } catch (err) {
      console.error('Error loading inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (inspection.folio || '').toLowerCase().includes(searchLower) ||
      inspection.units.unit_number.toLowerCase().includes(searchLower) ||
      (inspection.units.plates?.toLowerCase() || '').includes(searchLower)
    );
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta inspección?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInspections(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Error deleting inspection:', err);
      alert('Error al eliminar la inspección');
    }
  };

  const handleDownloadPDF = async (inspection: InspectionWithDetails) => {
    try {
      alert('Función de PDF próximamente disponible');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF');
    }
  };

  const handleViewDetails = async (inspection: InspectionWithDetails) => {
    setSelectedInspection(inspection);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Historial de Inspecciones</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por folio, unidad o placas..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('departure')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'departure'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Salida
            </button>
            <button
              onClick={() => setFilterType('return')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'return'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Retorno
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredInspections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No hay inspecciones
            </h3>
            <p className="text-slate-600">
              {searchTerm
                ? 'No se encontraron inspecciones con ese criterio de búsqueda.'
                : 'Aún no se han realizado inspecciones.'}
            </p>
          </div>
        ) : (
          filteredInspections.map((inspection) => (
            <div
              key={inspection.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      {inspection.folio || inspection.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        inspection.inspection_type === 'departure'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {inspection.inspection_type === 'departure' ? 'Salida' : 'Retorno'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <TruckIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{inspection.units.unit_number}</span>
                      {inspection.units.plates && (
                        <span className="text-slate-500">
                          ({inspection.units.plates})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(inspection.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className="text-slate-600">
                      Inspector: <span className="font-medium text-slate-900">{inspection.inspector?.full_name || '-'}</span>
                    </div>

                    {inspection.driver && (
                      <div className="text-slate-600">
                        Chofer: <span className="font-medium text-slate-900">{inspection.driver.full_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(inspection)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(inspection)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Descargar PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  {profile?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(inspection.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showDetails && selectedInspection && (
        <InspectionDetailsModal
          inspection={selectedInspection}
          onClose={() => {
            setShowDetails(false);
            setSelectedInspection(null);
          }}
        />
      )}
    </div>
  );
}

function InspectionDetailsModal({
  inspection,
  onClose,
}: {
  inspection: InspectionWithDetails;
  onClose: () => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const [itemsRes, evidenceRes] = await Promise.all([
        supabase
          .from('checklist_items')
          .select('*, inspection_parts(name)')
          .eq('inspection_id', inspection.id),
        supabase
          .from('inspection_evidence')
          .select('*')
          .eq('inspection_id', inspection.id),
      ]);

      if (itemsRes.data) setItems(itemsRes.data);
      if (evidenceRes.data) setEvidence(evidenceRes.data);
    } catch (err) {
      console.error('Error loading details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'no_damage') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">✓ Sin daño</span>;
    } else if (status === 'damaged') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">✗ Con daño</span>;
    } else {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">- No aplica</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {inspection.folio || inspection.id.substring(0, 8).toUpperCase()}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {new Date(inspection.created_at).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Unidad</h4>
                <p className="text-slate-900">{inspection.units.unit_number}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Tipo de Vehículo</h4>
                <p className="text-slate-900">{inspection.units.vehicle_types?.name || '-'}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Placas</h4>
                <p className="text-slate-900">{inspection.units.plates || '-'}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Tipo de Inspección</h4>
                <p className="text-slate-900">
                  {inspection.inspection_type === 'departure' ? 'Salida' : 'Retorno'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Inspector</h4>
                <p className="text-slate-900">{inspection.inspector?.full_name || '-'}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Chofer</h4>
                <p className="text-slate-900">{inspection.driver?.full_name || '-'}</p>
              </div>
            </div>

            {inspection.observations && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Observaciones</h4>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{inspection.observations}</p>
              </div>
            )}

            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Checklist</h4>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-slate-500 text-sm">No hay items de checklist</p>
                ) : (
                  items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.inspection_parts?.name || '-'}</p>
                        {item.notes && (
                          <p className="text-sm text-slate-600 mt-1">{item.notes}</p>
                        )}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))
                )}
              </div>
            </div>

            {evidence.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Evidencia</h4>
                <div className="space-y-2">
                  {evidence.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                      <span>{item.file_type === 'image' ? '📷' : '🎥'}</span>
                      <span className="text-sm text-slate-700">{item.file_path}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Firmas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Inspector</p>
                  {inspection.inspector_signature ? (
                    <img
                      src={inspection.inspector_signature}
                      alt="Firma inspector"
                      className="w-full h-32 object-contain border-2 border-slate-300 rounded-lg bg-white"
                    />
                  ) : (
                    <p className="text-slate-400 text-sm">Sin firma</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Chofer</p>
                  {inspection.driver_signature ? (
                    <img
                      src={inspection.driver_signature}
                      alt="Firma chofer"
                      className="w-full h-32 object-contain border-2 border-slate-300 rounded-lg bg-white"
                    />
                  ) : (
                    <p className="text-slate-400 text-sm">Sin firma</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}