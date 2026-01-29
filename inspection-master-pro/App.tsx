
import React, { useState } from 'react';
import { Screen, InspectionData } from './types';
import Dashboard from './screens/Dashboard';
import NewInspection from './screens/NewInspection';
import Checklist from './screens/Checklist';
import Review from './screens/Review';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('DASHBOARD');
  const [currentInspection, setCurrentInspection] = useState<InspectionData>({
    unitType: 'truck',
    folio: '',
    driverName: '',
    departure: '',
    return: '',
    checklist: {
      mirrors: 'OK',
      tires: 'WARNING',
      doors: 'ERROR'
    },
    observations: ''
  });

  const navigateTo = (screen: Screen) => {
    setActiveScreen(screen);
    window.scrollTo(0, 0);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'DASHBOARD':
        return <Dashboard onNewInspection={() => navigateTo('NEW_INSPECTION')} />;
      case 'NEW_INSPECTION':
        return (
          <NewInspection
            data={currentInspection}
            setData={setCurrentInspection}
            onBack={() => navigateTo('DASHBOARD')}
            onNext={() => navigateTo('CHECKLIST')}
          />
        );
      case 'CHECKLIST':
        return (
          <Checklist
            data={currentInspection}
            setData={setCurrentInspection}
            onBack={() => navigateTo('NEW_INSPECTION')}
            onNext={() => navigateTo('REVIEW')}
          />
        );
      case 'REVIEW':
        return (
          <Review
            data={currentInspection}
            onBack={() => navigateTo('CHECKLIST')}
            onFinalize={() => {
                alert("Inspection Finalized & PDF Generated!");
                navigateTo('DASHBOARD');
            }}
          />
        );
      default:
        return <Dashboard onNewInspection={() => navigateTo('NEW_INSPECTION')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative shadow-2xl bg-white dark:bg-background-dark overflow-hidden">
      {renderScreen()}
    </div>
  );
};

export default App;
