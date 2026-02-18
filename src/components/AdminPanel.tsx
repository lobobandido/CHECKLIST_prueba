import { useState } from 'react';
import { Truck, Users, Settings as SettingsIcon, CheckSquare } from 'lucide-react';
import VehiclesManager from './admin/VehiclesManager';
import UsersManager from './admin/UsersManager';
import VehicleTypesManager from './admin/VehicleTypesManager';
import InspectionPartsManager from './admin/InspectionPartsManager';

type Tab = 'vehicles' | 'users' | 'vehicle-types' | 'inspection-parts';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('vehicles');

  const tabs = [
    { id: 'vehicles' as Tab, name: 'Unidades', icon: Truck },
    { id: 'users' as Tab, name: 'Usuarios', icon: Users },
    { id: 'vehicle-types' as Tab, name: 'Tipos de Vehículo', icon: SettingsIcon },
    { id: 'inspection-parts' as Tab, name: 'Partes de Inspección', icon: CheckSquare },
  ];

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Panel de Administración</h2>
          <p className="text-slate-600 mt-1">Gestiona catálogos y configuración del sistema</p>
        </div>

        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {activeTab === 'vehicles' && <VehiclesManager />}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'vehicle-types' && <VehicleTypesManager />}
        {activeTab === 'inspection-parts' && <InspectionPartsManager />}
      </div>
    </div>
  );
}
