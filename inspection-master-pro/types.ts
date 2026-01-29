
export type Screen = 'DASHBOARD' | 'NEW_INSPECTION' | 'CHECKLIST' | 'REVIEW' | 'SUCCESS';

export interface UnitType {
  id: string;
  name: string;
  icon: string;
}

export interface Inspection {
  id: string;
  unitId: string;
  driver: string;
  status: 'PASSED' | 'ISSUES_FOUND' | 'IN_PROGRESS';
  time: string;
  progress?: number;
}

export interface InspectionData {
  unitType: string;
  folio: string;
  driverName: string;
  departure: string;
  return: string;
  checklist: Record<string, 'OK' | 'WARNING' | 'ERROR' | null>;
  observations: string;
}
