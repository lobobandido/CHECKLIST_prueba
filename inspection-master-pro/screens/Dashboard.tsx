
import React from 'react';
import { RECENT_INSPECTIONS } from '../constants';

interface DashboardProps {
  onNewInspection: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewInspection }) => {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex size-10 shrink-0 items-center overflow-hidden rounded-full ring-2 ring-primary/20">
            <img 
                src="https://picsum.photos/seed/trucker/200/200" 
                alt="Profile" 
                className="size-full object-cover"
            />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 px-3">Inspection Dashboard</h2>
          <button className="flex size-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-card-dark transition-colors active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Summary Stats */}
        <div className="flex flex-wrap gap-3 p-4">
          <StatCard label="Active" value="12" color="bg-primary" />
          <StatCard label="Pending" value="05" color="bg-amber-500" />
          <StatCard label="Flagged" value="02" color="bg-red-500" textColor="text-red-500" />
        </div>

        {/* Primary Action */}
        <div className="px-4 py-2">
          <button 
            onClick={onNewInspection}
            className="flex w-full items-center justify-center rounded-xl h-14 bg-primary text-white gap-3 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-base font-bold">New Inspection</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex w-full items-stretch rounded-xl h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="text-slate-400 flex items-center justify-center pl-4">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3" 
              placeholder="Search Unit ID, Driver or Status"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 px-4 py-2 overflow-x-auto hide-scrollbar">
          <FilterChip icon="grid_view" label="All" active />
          <FilterChip icon="local_shipping" label="Tractocamión" />
          <FilterChip icon="inventory_2" label="Caja Seca" />
          <FilterChip icon="package_2" label="Remolque" />
        </div>

        {/* List */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Recent Inspections</h3>
            <button className="text-primary text-xs font-semibold">See all</button>
          </div>
          <div className="flex flex-col gap-3">
            {RECENT_INSPECTIONS.map(item => (
              <InspectionItem key={item.id} inspection={item} />
            ))}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 flex items-center justify-around px-4 pb-4 max-w-md mx-auto">
        <NavButton icon="home" label="Home" active />
        <NavButton icon="assignment" label="Reports" />
        <NavButton icon="garage" label="Fleet" />
        <NavButton icon="settings" label="Settings" />
      </nav>
    </>
  );
};

const StatCard = ({ label, value, color, textColor = "" }: any) => (
  <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-card-dark shadow-sm border border-slate-200 dark:border-white/5">
    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider">{label}</p>
    <p className={`text-2xl font-bold leading-tight ${textColor}`}>{value}</p>
    <div className={`h-1 w-8 ${color} rounded-full mt-1`}></div>
  </div>
);

const FilterChip = ({ icon, label, active = false }: any) => (
  <button className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 border border-slate-200 dark:border-white/5 ${active ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-300'}`}>
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
    <p className="text-xs font-semibold">{label}</p>
  </button>
);

// Fixed: Use any for the props object to avoid strict type error when passing 'key' during list mapping
const InspectionItem = ({ inspection }: any) => (
  <div className={`flex flex-col gap-3 rounded-xl p-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/5 shadow-sm ${inspection.status === 'IN_PROGRESS' ? 'ring-1 ring-primary/30' : ''}`}>
    <div className="flex items-start justify-between">
      <div className="flex gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${inspection.status === 'ISSUES_FOUND' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-blue-50 dark:bg-primary/10 text-primary'}`}>
          <span className="material-symbols-outlined">{inspection.unitId.includes('BOX') ? 'inventory_2' : 'local_shipping'}</span>
        </div>
        <div>
          <p className="text-sm font-bold">Unit ID: {inspection.unitId}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Driver: {inspection.driver}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          inspection.status === 'PASSED' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
          inspection.status === 'ISSUES_FOUND' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
          'bg-primary/10 text-primary'
        }`}>
          {inspection.status.replace('_', ' ')}
        </span>
        {inspection.progress && <span className="text-[10px] font-medium text-slate-400 mt-1">{inspection.progress}% Complete</span>}
      </div>
    </div>
    {inspection.progress ? (
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${inspection.progress}%` }}></div>
        </div>
    ) : (
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="text-[11px]">{inspection.time}</span>
            </div>
            <button className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                {inspection.status === 'ISSUES_FOUND' ? 'View Issues' : 'Report'} 
                <span className="material-symbols-outlined text-[14px]">
                    {inspection.status === 'ISSUES_FOUND' ? 'priority_high' : 'arrow_forward_ios'}
                </span>
            </button>
        </div>
    )}
  </div>
);

const NavButton = ({ icon, label, active = false }: any) => (
  <button className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-slate-400'}`}>
    <span className={`material-symbols-outlined text-[28px] ${active ? 'font-variation-fill' : ''}`}>{icon}</span>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default Dashboard;
