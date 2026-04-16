import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Clock,
  User,
  LogOut,
  Dumbbell,
} from 'lucide-react';
import { currentStudent } from '../../data/mockData';
import catalystLogo from '../../assets/catalyst-logo.png';

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'sessions',      label: 'My Sessions',     icon: Calendar },
  { id: 'slots',         label: 'Book a Slot',     icon: Clock },
  { id: 'communication', label: 'Communication',   icon: MessageSquare,   badge: 2 },
  { id: 'practiceTime',  label: 'Practice Time',   icon: Dumbbell },
  { id: 'profile',       label: 'My Profile',      icon: User },
];

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('');
}

export default function Sidebar({ active, onNavigate, onLogout }) {
  return (
    <aside className="w-[250px] bg-[#0f172a] flex flex-col fixed top-0 left-0 h-screen z-[100]">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[#1e293b] flex items-center">
        <img src={catalystLogo} alt="Catalyst" className="h-9 w-auto object-contain" />
      </div>

      {/* Logged-in user */}
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center gap-2.5">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {getInitials(currentStudent.name)}
        </div>
        <div className="overflow-hidden">
          <div className="text-[13px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
            {currentStudent.name}
          </div>
          <div className="text-[11px] text-slate-500 uppercase tracking-[0.5px]">Student</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-[1px] px-5 pt-2 pb-1">
          Main Menu
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => (
          <div
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-all border-l-[3px] text-sm font-medium
              ${active === id
                ? 'bg-[rgba(79,70,229,0.15)] border-l-indigo-600 text-white'
                : 'border-l-transparent text-slate-400 hover:bg-[#1e293b] hover:text-slate-200'
              }`}
          >
            <Icon size={18} />
            {label}
            {badge && (
              <span className="ml-auto bg-indigo-600 text-white text-[10px] font-bold px-[7px] py-[2px] rounded-[10px]">
                {badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="py-4 border-t border-[#1e293b]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-2.5 text-slate-400 cursor-pointer transition-all text-sm font-medium border-none bg-transparent w-full hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
