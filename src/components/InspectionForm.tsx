import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Minus, Camera, Video, FileText, Pen, Loader2, AlertCircle } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';
import type { Database } from '../lib/database.types';

type VehicleType = Database['public']['Tables']['vehicle_types']['Row'];
type Unit = Database['public']['Tables']['units']['Row'];
type InspectionPart = Database['public']['Tables']['inspection_parts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ChecklistItem {
  partId: string;
  partName: string;
  status: 'no_damage' | 'damaged' | 'not_applicable';
  notes: string;
}

export default function InspectionForm() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [inspectionParts, setInspectionParts] = useState<InspectionPart[]>([]);

  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [inspectionType, setInspectionType] = useState<'departure' | 'return'>('departure');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [observations, setObservations] = useState('');

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [inspectorSignature, setInspectorSignature] = useState('');
  const [driverSignature, setDriverSignature] = useState('');

  const [showInspectorSignature, setShowInspectorSignature] = useState(false);
  const [showDriverSignature, setShowDriverSignature] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedVehicleType) {
      loadInspectionParts();
    }
  }, [selectedVehicleType]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [vehicleTypesRes, unitsRes, driversRes] = await Promise.all([
        supabase.from('vehicle_types').select('*').order('name'),
        supabase.from('units').select('*').eq('active', true).order('unit_number'),
        supabase.from('profiles').select('*').eq('role', 'chofer').order('full_name'),
      ]);

      if (vehicleTypesRes.data) setVehicleTypes(vehicleTypesRes.data);
      if (unitsRes.data) setUnits(unitsRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
    } catch (err) {
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const loadInspectionParts = async () => {
    try {
      const { data, error } = await supabase
        .from('inspection_parts')
        .select('*')
        .order('display_order');

      if (error) throw error;

      if (data) {
        setInspectionParts(data);
        setChecklistItems(
          data.map(part => ({
            partId: part.id,
            partName: part.name,
            status: 'no_damage' as const,
            notes: '',
          }))
        );
      }
    } catch (err) {
      console.error('Error cargando partes:', err);
      setError('Error al cargar las partes de inspección');
    }
  };

  const updateChecklistItem = (partId: string, field: 'status' | 'notes', value: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.partId === partId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newVideos = Array.from(e.target.files).filter(file => {
        return file.size <= 100 * 1024 * 1024;
      });
      setVideos(prev => [...prev, ...newVideos]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicle || !selectedDriver) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!inspectorSignature || !driverSignature) {
      setError('Se requieren ambas firmas para completar la inspección');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
     const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .insert({
            folio: `INS-${Date.now()}`, // Genera folio temporal
            unit_id: selectedVehicle,
            vehicle_type_id: selectedVehicleType,
            inspection_type: inspectionType,
            inspector_id: profile!.id,
            driver_id: selectedDriver,
            inspector_signature: inspectorSignature,
            driver_signature: driverSignature,
            observations,
            completed_at: new Date().toISOString(),
  })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      const itemsToInsert = checklistItems.map(item => ({
        inspection_id: inspection.id,
        inspection_part_id: item.partId,
        status: item.status,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      for (const image of images) {
        const fileName = `${inspection.id}/${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('inspection-evidence')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { error: evidenceError } = await supabase
          .from('inspection_evidence')
          .insert({
            inspection_id: inspection.id,
            file_path: fileName,
            file_type: 'image',
          });

        if (evidenceError) throw evidenceError;
      }

      for (const video of videos) {
        const fileName = `${inspection.id}/${Date.now()}_${video.name}`;
        const { error: uploadError } = await supabase.storage
          .from('inspection-evidence')
          .upload(fileName, video);

        if (uploadError) throw uploadError;

        const { error: evidenceError } = await supabase
          .from('inspection_evidence')
          .insert({
            inspection_id: inspection.id,
            file_path: fileName,
            file_type: 'video',
          });

        if (evidenceError) throw evidenceError;
      }

      setSuccess(`Inspección completada exitosamente`);

      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar la inspección');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedVehicleType('');
    setSelectedVehicle('');
    setInspectionType('departure');
    setSelectedDriver('');
    setObservations('');
    setChecklistItems([]);
    setInspectorSignature('');
    setDriverSignature('');
    setImages([]);
    setVideos([]);
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Nueva Inspección</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de unidad *
              </label>
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Seleccionar tipo</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unidad *
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Seleccionar unidad</option>
                {units
                  .filter(u => !selectedVehicleType || u.vehicle_type_id === selectedVehicleType)
                  .map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_number} {unit.plates ? `- ${unit.plates}` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de inspección *
              </label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value as 'departure' | 'return')}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="departure">Salida</option>
                <option value="return">Retorno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chofer *
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Seleccionar chofer</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {checklistItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Checklist de Inspección
              </h3>
              <div className="space-y-4">
                {checklistItems.map((item) => (
                  <div
                    key={item.partId}
                    className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">{item.partName}</h4>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => updateChecklistItem(item.partId, 'status', 'no_damage')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          item.status === 'no_damage'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-green-300'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Sin daño</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateChecklistItem(item.partId, 'status', 'damaged')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          item.status === 'damaged'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-red-300'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Con daño</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateChecklistItem(item.partId, 'status', 'not_applicable')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          item.status === 'not_applicable'
                            ? 'border-slate-500 bg-slate-100 text-slate-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                        <span className="text-sm font-medium">No aplica</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateChecklistItem(item.partId, 'notes', e.target.value)}
                      placeholder="Notas adicionales (opcional)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observaciones generales
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Comentarios adicionales sobre la inspección..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fotografías
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors"
              >
                <Camera className="w-5 h-5 text-slate-600" />
                <span className="text-sm text-slate-600">Subir fotos</span>
              </label>
              {images.length > 0 && (
                <div className="mt-2 space-y-2">
                  {images.map((image, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700 truncate">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Videos
              </label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors"
              >
                <Video className="w-5 h-5 text-slate-600" />
                <span className="text-sm text-slate-600">Subir videos</span>
              </label>
              {videos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700 truncate">{video.name}</span>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Firma del inspector *
              </label>
              {inspectorSignature ? (
                <div className="relative">
                  <img
                    src={inspectorSignature}
                    alt="Firma del inspector"
                    className="w-full h-32 object-contain border-2 border-slate-300 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setInspectorSignature('')}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInspectorSignature(true)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 transition-colors"
                >
                  <Pen className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-600">Firmar como inspector</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Firma del chofer *
              </label>
              {driverSignature ? (
                <div className="relative">
                  <img
                    src={driverSignature}
                    alt="Firma del chofer"
                    className="w-full h-32 object-contain border-2 border-slate-300 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setDriverSignature('')}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDriverSignature(true)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 transition-colors"
                >
                  <Pen className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-600">Firmar como chofer</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Completar inspección
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showInspectorSignature && (
        <SignatureCanvas
          title="Firma del Inspector"
          onSave={setInspectorSignature}
          onClose={() => setShowInspectorSignature(false)}
        />
      )}

      {showDriverSignature && (
        <SignatureCanvas
          title="Firma del Chofer"
          onSave={setDriverSignature}
          onClose={() => setShowDriverSignature(false)}
        />
      )}
    </div>
  );
}