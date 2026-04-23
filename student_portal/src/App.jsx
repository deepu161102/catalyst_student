import { useState, useEffect } from 'react';
import { authService, studentService } from './services/api';

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
      .then(async (res) => {
        const base = res.data;
        try {
          const mentorRes = await studentService.getMentor(base._id);
          setStudent({ ...base, mentor: mentorRes.data?.mentor || null, batchInfo: mentorRes.data?.batch || null });
        } catch {
          setStudent(base);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const handleLogin = async (data) => {
    try {
      const mentorRes = await studentService.getMentor(data._id);
      setStudent({ ...data, mentor: mentorRes.data?.mentor || null, batchInfo: mentorRes.data?.batch || null });
    } catch {
      setStudent(data);
    }
  };

  if (!student) {
    return <SignIn onLogin={handleLogin} />;
  }

  const handleLogout = async () => {
    await authService.logout();
    setStudent(null);
    setPage('dashboard');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <Dashboard student={student} onNavigate={setPage} />;
      case 'sessions':      return <Sessions onNavigate={setPage} />;
      case 'slots':         return <Slots />;
      case 'communication': return <Communication student={student} />;
      case 'practiceTime':  return <PracticeTime />;
      case 'profile':       return <Profile student={student} onUpdateStudent={(updated) => setStudent(s => ({ ...s, ...updated, mentor: s.mentor, batchInfo: s.batchInfo }))} />;
      default:              return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <Layout page={page} onNavigate={setPage} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}
