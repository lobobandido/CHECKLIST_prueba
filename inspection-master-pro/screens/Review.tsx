
import React from 'react';
import { InspectionData } from '../types';

interface ReviewProps {
  data: InspectionData;
  onBack: () => void;
  onFinalize: () => void;
}

const Review: React.FC<ReviewProps> = ({ data, onBack, onFinalize }) => {
  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
      <header className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 border-b border-slate-200 dark:border-slate-800 justify-between">
        <button onClick={onBack} className="text-primary flex size-10 items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center pr-10">Final Review</h2>
      </header>

      <main className="flex-1 pb-10">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold px-4 pb-2 pt-6">Inspection Summary</h3>
        <div className="px-4 py-2">
          <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-slate-900 dark:text-white text-base font-bold">Unit ID: {data.folio || 'TRK-402'}</p>
              <p className="text-slate-500 dark:text-[#90a4cb] text-sm font-normal">Pre-trip Inspection</p>
              <p className="text-slate-400 dark:text-[#90a4cb] text-xs font-normal">Oct 24, 2023 • 08:45 AM</p>
            </div>
            <div className="w-24 h-24 overflow-hidden rounded-lg">
                <img src="https://picsum.photos/seed/trk/200/200" className="size-full object-cover" alt="Truck" />
            </div>
          </div>
        </div>

        <h3 className="text-slate-900 dark:text-white text-lg font-bold px-4 pb-2 pt-6">Damages Found (2)</h3>
        <div className="flex flex-col gap-1">
          <DamageItem title="Front Bumper - Scratched" description="Minor cosmetic damage reported" severity="warning" />
          <DamageItem title="Left Headlight - Cracked" description="Housing glass broken, bulb functional" severity="error" />
        </div>

        <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider px-4 pb-2 pt-6">Attached Media</h3>
        <div className="flex gap-3 px-4 overflow-x-auto pb-4 hide-scrollbar">
          <MediaThumbnail src="https://picsum.photos/seed/scratch1/150/150" />
          <MediaThumbnail src="https://picsum.photos/seed/scratch2/150/150" />
          <div className="min-w-[100px] h-[100px] rounded-lg bg-slate-200 dark:bg-card-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">add_a_photo</span>
          </div>
        </div>

        <div className="px-4 py-6 bg-slate-50 dark:bg-background-dark mt-4">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Required Signatures</h3>
          
          <SignatureSection 
            label="Firma del Chofer" 
            placeholder="Nombre completo del Chofer" 
            defaultValue={data.driverName}
          />
          
          <SignatureSection 
            label="Firma del Supervisor" 
            placeholder="Nombre completo del Supervisor" 
          />

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed mt-6">
            Al firmar, ambas partes confirman que la información detallada en este reporte de inspección es verídica y aceptan el estado actual de la unidad.
          </p>
        </div>
      </main>

      <div className="p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto w-full">
        <button 
          onClick={onFinalize}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">description</span>
          Finalize and Generate PDF
        </button>
      </div>
    </div>
  );
};

const DamageItem = ({ title, description, severity }: any) => (
  <div className="flex items-center gap-4 bg-white dark:bg-surface-dark/40 px-4 min-h-[72px] py-3 justify-between border-b border-slate-100 dark:border-slate-800/50">
    <div className="flex items-center gap-4">
      <div className={`flex items-center justify-center rounded-lg shrink-0 size-12 ${
        severity === 'warning' ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'text-red-500 bg-red-50 dark:bg-red-500/10'
      }`}>
        <span className="material-symbols-outlined">{severity}</span>
      </div>
      <div>
        <p className="text-slate-900 dark:text-white text-base font-medium line-clamp-1">{title}</p>
        <p className="text-slate-500 dark:text-[#90a4cb] text-sm line-clamp-2">{description}</p>
      </div>
    </div>
    <div className={`size-3 rounded-full ${severity === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
  </div>
);

const MediaThumbnail = ({ src }: { src: string }) => (
  <div className="min-w-[100px] h-[100px] rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
    <img src={src} className="size-full object-cover" alt="Damage proof" />
  </div>
);

const SignatureSection = ({ label, placeholder, defaultValue = "" }: any) => (
  <div className="mb-8">
    <div className="flex justify-between items-end mb-2">
      <label className="text-sm font-medium text-slate-600 dark:text-[#90a4cb]">{label}</label>
      <button className="text-primary text-xs font-semibold">BORRAR</button>
    </div>
    <div 
        className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-dark flex items-center justify-center h-[120px]"
        style={{
            backgroundImage: 'linear-gradient(to right, #222f49 1px, transparent 1px)',
            backgroundSize: '20px 100%',
            backgroundPosition: '0 90%',
            backgroundRepeat: 'repeat-x'
        }}
    >
      <span className="text-slate-300 dark:text-slate-600 text-sm italic">Sign here</span>
    </div>
    <input 
      className="mt-2 w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" 
      placeholder={placeholder} 
      defaultValue={defaultValue}
      type="text"
    />
  </div>
);

export default Review;
