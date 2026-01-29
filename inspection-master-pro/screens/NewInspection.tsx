
import React from 'react';
import { UNIT_TYPES } from '../constants';
import { InspectionData } from '../types';

interface NewInspectionProps {
  data: InspectionData;
  setData: (data: InspectionData) => void;
  onBack: () => void;
  onNext: () => void;
}

const NewInspection: React.FC<NewInspectionProps> = ({ data, setData, onBack, onNext }) => {
  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
      <header className="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-[#314368]/30">
        <div className="flex items-center p-4 justify-between">
          <button onClick={onBack} className="text-slate-900 dark:text-white flex size-10 items-center justify-start">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center pr-10">New Inspection</h2>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <section>
          <h3 className="text-slate-900 dark:text-white text-lg font-bold px-4 pb-2 pt-6">Select Unit Type</h3>
          <div className="grid grid-cols-2 gap-3 p-4">
            {UNIT_TYPES.map(unit => (
              <button
                key={unit.id}
                onClick={() => setData({ ...data, unitType: unit.id })}
                className={`flex flex-col gap-3 rounded-xl border-2 p-4 items-center justify-center text-center transition-all ${
                  data.unitType === unit.id 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-[#314368] bg-white dark:bg-surface-dark text-slate-600 dark:text-white'
                } ${unit.id === 'container' ? 'col-span-2' : ''}`}
              >
                <span className={`material-symbols-outlined !text-4xl ${data.unitType === unit.id ? 'text-primary' : ''}`}>{unit.icon}</span>
                <h2 className="text-sm font-bold leading-tight">{unit.name}</h2>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-slate-900 dark:text-white text-lg font-bold px-4 pb-2 pt-6">Trip Details</h3>
          
          <div className="flex flex-col gap-1 px-4 py-3">
            <label className="block w-full">
              <p className="text-slate-700 dark:text-white text-sm font-medium pb-2">Folio Number</p>
              <input 
                value={data.folio}
                onChange={(e) => setData({ ...data, folio: e.target.value })}
                className="w-full rounded-lg bg-white dark:bg-surface-dark border border-[#314368] h-14 px-4 text-base focus:ring-primary focus:border-primary" 
                placeholder="e.g. #7721-X" 
              />
            </label>
          </div>

          <div className="flex flex-col gap-1 px-4 py-3">
            <label className="block w-full">
              <p className="text-slate-700 dark:text-white text-sm font-medium pb-2">Nombre del Operador</p>
              <input 
                value={data.driverName}
                onChange={(e) => setData({ ...data, driverName: e.target.value })}
                className="w-full rounded-lg bg-white dark:bg-surface-dark border border-[#314368] h-14 px-4 text-base focus:ring-primary focus:border-primary" 
                placeholder="Enter driver name" 
              />
            </label>
          </div>

          <div className="flex gap-4 px-4 py-3">
            <label className="flex-1">
              <p className="text-slate-700 dark:text-white text-sm font-medium pb-2">Salida</p>
              <input 
                type="datetime-local" 
                value={data.departure}
                onChange={(e) => setData({ ...data, departure: e.target.value })}
                className="w-full rounded-lg bg-white dark:bg-surface-dark border border-[#314368] h-14 px-4 text-sm focus:ring-primary focus:border-primary" 
              />
            </label>
            <label className="flex-1">
              <p className="text-slate-700 dark:text-white text-sm font-medium pb-2">Regreso</p>
              <input 
                type="datetime-local" 
                value={data.return}
                onChange={(e) => setData({ ...data, return: e.target.value })}
                className="w-full rounded-lg bg-white dark:bg-surface-dark border border-[#314368] h-14 px-4 text-sm focus:ring-primary focus:border-primary" 
              />
            </label>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-[#314368]/30 max-w-md mx-auto">
        <button 
          onClick={onNext}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <span>Continue to Checklist</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default NewInspection;
