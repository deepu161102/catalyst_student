import { useState, useEffect } from 'react';
import { authService } from './services/api';

import SignIn        from './components/auth/SignIn';
import Layout        from './components/layout/Layout';
import Dashboard     from './pages/Dashboard/Dashboard';
import Sessions      from './pages/Sessions/Sessions';
import Slots         from './pages/Slots/Slots';
import Communication from './pages/Communication/Communication';
import Profile       from './pages/Profile/Profile';
import PracticeTime  from './pages/PracticeTime/PracticeTime';

export default function App() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState('dashboard');

  // On mount: validate cookie with server — restores session after refresh
  useEffect(() => {
    authService.me()
      .then((res) => setStudent(res.data))
      .catch(() => {}) // no cookie or expired — stay on login
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return <SignIn onLogin={(data) => setStudent(data)} />;
  }

  const handleLogout = async () => {
    await authService.logout();
    setStudent(null);
    setPage('dashboard');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <Dashboard onNavigate={setPage} />;
      case 'sessions':      return <Sessions onNavigate={setPage} />;
      case 'slots':         return <Slots />;
      case 'communication': return <Communication />;
      case 'practiceTime':  return <PracticeTime />;
      case 'profile':       return <Profile student={student} onUpdateStudent={setStudent} />;
      default:              return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <Layout page={page} onNavigate={setPage} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}
