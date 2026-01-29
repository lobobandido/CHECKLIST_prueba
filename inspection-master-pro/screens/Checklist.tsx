
import React from 'react';
import { CHECKLIST_ITEMS } from '../constants';
import { InspectionData } from '../types';

interface ChecklistProps {
  data: InspectionData;
  setData: (data: InspectionData) => void;
  onBack: () => void;
  onNext: () => void;
}

const Checklist: React.FC<ChecklistProps> = ({ data, setData, onBack, onNext }) => {
  const updateItemStatus = (itemId: string, status: 'OK' | 'WARNING' | 'ERROR') => {
    setData({
      ...data,
      checklist: { ...data.checklist, [itemId]: status }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <button onClick={onBack} className="text-primary flex size-10 items-center">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center">Inspección: Tractocamión</h2>
          <div className="w-10 flex justify-end">
            <button onClick={onNext} className="text-primary text-base font-bold">Listo</button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium uppercase tracking-wider">Progreso</p>
            <p className="text-primary text-sm font-bold">65%</p>
          </div>
          <div className="rounded-full bg-slate-200 dark:bg-[#314368] h-2.5 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold">Estado Exterior</h3>
        </div>

        <div className="flex flex-col bg-white dark:bg-slate-900/50 mx-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {CHECKLIST_ITEMS.map((item, index) => (
            <div key={item.id} className={`flex items-center gap-4 px-4 min-h-16 justify-between ${index < CHECKLIST_ITEMS.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="text-slate-500 dark:text-slate-300 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-card-dark size-10">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <p className="text-slate-900 dark:text-white text-base font-medium">{item.name}</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <StatusToggle 
                  active={data.checklist[item.id] === 'OK'} 
                  onClick={() => updateItemStatus(item.id, 'OK')} 
                  icon="check" 
                  activeColor="bg-green-500" 
                />
                <StatusToggle 
                  active={data.checklist[item.id] === 'WARNING'} 
                  onClick={() => updateItemStatus(item.id, 'WARNING')} 
                  icon="warning" 
                  activeColor="bg-yellow-500" 
                />
                <StatusToggle 
                  active={data.checklist[item.id] === 'ERROR'} 
                  onClick={() => updateItemStatus(item.id, 'ERROR')} 
                  icon="close" 
                  activeColor="bg-red-500" 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pt-8 pb-4">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Evidencia Multimedia</h3>
          <div className="grid grid-cols-2 gap-4">
            <MediaButton icon="add_a_photo" label="Añadir Foto" />
            <MediaButton icon="video_call" label="Añadir Video" />
          </div>
        </div>

        <div className="px-4 pt-4">
          <label className="block text-slate-900 dark:text-white text-lg font-bold mb-4">Observaciones</label>
          <textarea 
            value={data.observations}
            onChange={(e) => setData({ ...data, observations: e.target.value })}
            className="w-full rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 focus:ring-primary focus:border-primary" 
            placeholder="Escriba aquí cualquier detalle relevante de la unidad..." 
            rows={4}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto">
        <button 
          onClick={onNext}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <span>Guardar y Continuar</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

const StatusToggle = ({ active, onClick, icon, activeColor }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center size-8 rounded-md transition-all ${active ? `${activeColor} text-white shadow-sm` : 'text-slate-400'}`}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
  </button>
);

const MediaButton = ({ icon, label }: any) => (
  <button className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
    <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
  </button>
);

export default Checklist;
