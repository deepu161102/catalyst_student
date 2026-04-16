import Sidebar from './Sidebar';

const PAGE_META = {
  dashboard:     { title: 'Dashboard',        subtitle: 'Welcome to your learning portal' },
  assignments:   { title: 'Assignments',       subtitle: 'Track and submit your assignments' },
  sessions:      { title: 'My Sessions',       subtitle: 'Upcoming and past mentor sessions' },
  slots:         { title: 'Book a Slot',       subtitle: 'Available one-on-one slots from your mentor' },
  communication: { title: 'Communication',     subtitle: 'Chat with your mentor' },
  profile:       { title: 'My Profile',        subtitle: 'Manage your account information' },
};

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Layout({ page, onNavigate, onLogout, children }) {
  const { title, subtitle } = PAGE_META[page] ?? PAGE_META.dashboard;

  return (
    <div className="flex min-h-screen">
      <Sidebar active={page} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="ml-[250px] flex-1 min-h-screen bg-slate-100">
        {/* Top bar */}
        <div className="bg-white px-7 py-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-50">
          <div>
            <div className="text-xl font-bold text-slate-900">{title}</div>
            <div className="text-[13px] text-slate-500 mt-0.5">{subtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-slate-500 bg-slate-100 px-[14px] py-[6px] rounded-full">
              {formatDate()}
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
