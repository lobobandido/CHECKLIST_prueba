import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import InspectionForm from './components/InspectionForm';
import InspectionHistory from './components/InspectionHistory';
import AdminPanel from './components/AdminPanel';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('new');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const defaultTab = profile.role === 'driver' ? 'history' : 'new';
  const currentTab = activeTab === 'new' && profile.role === 'driver' ? defaultTab : activeTab;

  return (
    <Layout activeTab={currentTab} onTabChange={setActiveTab}>
      {currentTab === 'new' && <InspectionForm />}
      {currentTab === 'history' && <InspectionHistory />}
      {currentTab === 'admin' && <AdminPanel />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
