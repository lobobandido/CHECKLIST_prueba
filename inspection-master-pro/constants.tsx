
import { UnitType, Inspection } from './types';

export const UNIT_TYPES: UnitType[] = [
  { id: 'truck', name: 'Tractocamión', icon: 'local_shipping' },
  { id: 'box', name: 'Caja seca', icon: 'inventory_2' },
  { id: 'van', name: 'Camioneta', icon: 'airport_shuttle' },
  { id: 'dolly', name: 'Dolly', icon: 'rv_hookup' },
  { id: 'container', name: 'Contenedor', icon: 'box' },
];

export const RECENT_INSPECTIONS: Inspection[] = [
  { id: '1', unitId: 'TRK-2048', driver: 'Carlos Méndez', status: 'PASSED', time: 'Today, 08:45 AM' },
  { id: '2', unitId: 'BOX-7721', driver: 'Sofia Ramirez', status: 'ISSUES_FOUND', time: 'Yesterday, 04:20 PM' },
  { id: '3', unitId: 'TRK-9902', driver: 'Jorge Alanis', status: 'IN_PROGRESS', time: 'Today, 10:15 AM', progress: 65 },
];

export const CHECKLIST_ITEMS = [
  { id: 'mirrors', name: 'Espejos', icon: 'visibility' },
  { id: 'tires', name: 'Llantas', icon: 'settings_input_component' },
  { id: 'doors', name: 'Puertas', icon: 'sensor_door' },
  { id: 'lights', name: 'Luces', icon: 'lightbulb' },
];
