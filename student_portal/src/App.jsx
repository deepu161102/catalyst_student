import { useState } from 'react';

// Auth
import SignIn from './components/auth/SignIn';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard     from './pages/Dashboard/Dashboard';
import Assignments   from './pages/Assignments/Assignments';
import Sessions      from './pages/Sessions/Sessions';
import Slots         from './pages/Slots/Slots';
import Communication from './pages/Communication/Communication';
import Profile       from './pages/Profile/Profile';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage]             = useState('dashboard');

  if (!isLoggedIn) {
    return <SignIn onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <Dashboard     onNavigate={setPage} />;
      case 'assignments':   return <Assignments />;
      case 'sessions':      return <Sessions      onNavigate={setPage} />;
      case 'slots':         return <Slots />;
      case 'communication': return <Communication />;
      case 'profile':       return <Profile />;
      default:              return <Dashboard     onNavigate={setPage} />;
    }
  };

  return (
    <Layout
      page={page}
      onNavigate={setPage}
      onLogout={() => { setIsLoggedIn(false); setPage('dashboard'); }}
    >
      {renderPage()}
    </Layout>
  );
}
