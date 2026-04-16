import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Star,
  TrendingUp,
} from 'lucide-react';
import { currentStudent, sessions } from '../../data/mockData';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';

function getDay(dateStr) { return new Date(dateStr).getDate(); }
function getMon(dateStr) { return new Date(dateStr).toLocaleString('default', { month: 'short' }); }

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard({ onNavigate }) {
  const upcoming = sessions.filter((s) => s.status === 'upcoming');

  return (
    <div className="page-content">
      {/* ── Welcome banner ───────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-600 to-[#7c3aed] rounded-[14px] px-8 py-7 text-white mb-6 flex items-center justify-between overflow-hidden">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-10 right-[120px] w-[200px] h-[200px] bg-white/5 rounded-full" />
        <div className="pointer-events-none absolute -bottom-[60px] right-[60px] w-[160px] h-[160px] bg-white/5 rounded-full" />

        <div className="relative z-10">
          <h2 className="text-[22px] font-bold text-white mb-1.5">
            {greeting()}, {currentStudent.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-sm text-white/75">
            You're {currentStudent.progress}% through your course. Keep it up!
          </p>
          <div className="mt-4 flex gap-2.5">
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              onClick={() => onNavigate('slots')}
            >
              <Calendar size={14} /> Book a Session
            </button>
          </div>
        </div>
        <div className="text-[64px] leading-none relative z-10">🎓</div>
      </div>

      {/* ── Stats row ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-5 mb-7">
        <StatCard icon={TrendingUp} count={`${currentStudent.progress}%`} label="Course Progress" colorClass="indigo">
          <div className="bg-slate-200 rounded-[10px] h-1.5 mt-2" style={{ width: 80 }}>
            <div
              className="h-full rounded-[10px] bg-gradient-to-r from-indigo-600 to-violet-500"
              style={{ width: `${currentStudent.progress}%` }}
            />
          </div>
        </StatCard>
        <StatCard icon={CheckCircle} count={currentStudent.completedSessions} label="Sessions Completed" colorClass="green" />
        <StatCard icon={Calendar}    count={upcoming.length}                   label="Upcoming Sessions"  colorClass="purple" />
      </div>

      {/* ── Upcoming sessions ────────────────────────────── */}
      <div className="mb-5">
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Calendar size={18} color="#4f46e5" /> Upcoming Sessions</span>
            <button className="btn btn-sm btn-outline" onClick={() => onNavigate('sessions')}>
              View all <ChevronRight size={13} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              message="No upcoming sessions. Book a slot with your mentor!"
              action={
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('slots')}>
                  Book Now
                </button>
              }
            />
          ) : (
            upcoming.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3.5 py-3.5 border-b border-slate-100 last:border-b-0 last:pb-0"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-[10px] flex flex-col items-center justify-center flex-shrink-0 text-white">
                  <span className="text-base font-bold leading-none">{getDay(s.date)}</span>
                  <span className="text-[10px] uppercase opacity-[0.85]">{getMon(s.date)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{s.title}</h4>
                  <p className="text-xs text-slate-500">{s.time} · {s.duration} · {s.mentor}</p>
                </div>
                <span className="ml-auto px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-indigo-600/10 text-indigo-600">
                  Upcoming
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Bottom grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Mentor card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Star size={18} color="#4f46e5" /> My Mentor</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {currentStudent.mentor.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="font-bold text-base text-slate-900 mb-0.5">
                {currentStudent.mentor.name}
              </div>
              <div className="text-[13px] text-slate-500 mb-1.5">
                {currentStudent.mentor.specialisation} · {currentStudent.mentor.experience} exp
              </div>
              <span className="inline-flex items-center gap-1.5 bg-indigo-600/[0.08] text-indigo-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                <Star size={11} /> Your Mentor
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('communication')}>Message</button>
            <button className="btn btn-outline btn-sm"  onClick={() => onNavigate('slots')}>Book Slot</button>
          </div>
        </div>

        {/* Course info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><BookOpen size={18} color="#4f46e5" /> Course Details</span>
          </div>
          <div className="flex flex-col">
            {[
              { label: 'Course',          value: currentStudent.course },
              { label: 'Batch',           value: currentStudent.batch },
              { label: 'Enrolled',        value: currentStudent.enrollmentDate },
              { label: 'Total Sessions',  value: `${currentStudent.totalSessions} sessions` },
              { label: 'Completed',       value: `${currentStudent.completedSessions} of ${currentStudent.totalSessions}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between py-2 border-b border-slate-100 last:border-b-0 text-sm"
              >
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3.5">
            <div className="flex justify-between text-[13px] mb-1">
              <span className="text-slate-500">Overall Progress</span>
              <span className="font-bold text-indigo-600">{currentStudent.progress}%</span>
            </div>
            <div className="bg-slate-200 rounded-[10px] h-1.5">
              <div
                className="h-full rounded-[10px] bg-gradient-to-r from-indigo-600 to-violet-500"
                style={{ width: `${currentStudent.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
