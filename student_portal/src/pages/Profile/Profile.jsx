import { useState } from 'react';
import {
  User, Mail, Phone, BookOpen,
  Calendar, Star, CheckCircle, Edit2, Save, X,
} from 'lucide-react';
import { authService } from '../../services/api';
import { currentStudent } from '../../data/mockData';

export default function Profile({ student, onUpdateStudent }) {
  const fallback = currentStudent;
  const src = student || fallback;

  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(src.name);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const initials = name.split(' ').map((n) => n[0]).join('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await authService.updateName(name);
      onUpdateStudent?.(res.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(src.name);
    setEditing(false);
    setError('');
  };

  return (
    <div className="page-content">
      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-[18px] py-3 rounded-[10px] mb-5 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-[18px] py-3 rounded-[10px] mb-5 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[300px_1fr] gap-5">
        {/* ── Left column ── */}
        <div>
          <div className="bg-white rounded-[14px] border border-slate-200 px-6 py-7 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-[28px] font-bold text-white mx-auto mb-4">
              {initials}
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">{name}</div>
            <div className="text-[13px] text-slate-500 mb-5">Student · {src.course || fallback.course}</div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-600/[0.08] text-indigo-600 px-2.5 py-1 rounded-full text-xs font-semibold mb-5">
              <Star size={11} /> {src.batch || fallback.batch}
            </span>

            <div>
              {[
                { icon: Mail,     label: 'Email',    value: src.email },
                { icon: Phone,    label: 'Phone',    value: src.phone || fallback.phone },
                { icon: BookOpen, label: 'Course',   value: src.course || fallback.course },
                { icon: Calendar, label: 'Enrolled', value: src.enrollmentDate || fallback.enrollmentDate },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 py-2.5 border-b border-slate-100 last:border-b-0 text-[13px] text-slate-500 text-left">
                  <Icon size={15} color="#94a3b8" className="flex-shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.5px] text-slate-400 mb-0.5">{label}</div>
                    <strong className="text-slate-900 text-[13px]">{value}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="text-slate-500">Course Progress</span>
                <span className="font-bold text-indigo-600">{src.progress ?? fallback.progress}%</span>
              </div>
              <div className="bg-slate-200 rounded-[10px] h-1.5">
                <div
                  className="h-full rounded-[10px] bg-gradient-to-r from-indigo-600 to-violet-500"
                  style={{ width: `${src.progress ?? fallback.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          {/* Personal info */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><User size={18} color="#4f46e5" /> Personal Information</span>
              {!editing ? (
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                  <Edit2 size={13} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm" onClick={handleCancel} disabled={saving}>
                    <X size={13} /> Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Name — editable */}
              <div className="bg-white border border-slate-200 rounded-[10px] p-4">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px] mb-1.5">Full Name</div>
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border-[1.5px] border-indigo-600 rounded-md text-sm outline-none text-slate-900"
                  />
                ) : (
                  <div className="text-sm font-semibold text-slate-900">{name}</div>
                )}
              </div>

              {/* Email — read only */}
              <div className="bg-white border border-slate-200 rounded-[10px] p-4">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px] mb-1.5">Email Address</div>
                <div className="text-sm font-semibold text-slate-900">{src.email}</div>
              </div>

              {/* Phone — read only */}
              <div className="bg-white border border-slate-200 rounded-[10px] p-4">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px] mb-1.5">Phone Number</div>
                <div className="text-sm font-semibold text-slate-900">{src.phone || fallback.phone}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[10px] p-4">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px] mb-1.5">Batch</div>
                <div className="text-sm font-semibold text-slate-900">{src.batch || fallback.batch}</div>
              </div>
            </div>
          </div>

          {/* Enrollment details */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><BookOpen size={18} color="#4f46e5" /> Enrollment Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Course',             value: src.course || fallback.course },
                { label: 'Enrollment Date',    value: src.enrollmentDate || fallback.enrollmentDate },
                { label: 'Batch',              value: src.batch || fallback.batch },
                { label: 'Total Sessions',     value: String(src.totalSessions ?? fallback.totalSessions) },
                { label: 'Completed Sessions', value: String(src.completedSessions ?? fallback.completedSessions) },
                { label: 'Upcoming Sessions',  value: String(src.upcomingSessions ?? fallback.upcomingSessions) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-[10px] p-4">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px] mb-1.5">{label}</div>
                  <div className="text-sm font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor details */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Star size={18} color="#4f46e5" /> My Mentor</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {(src.mentor?.name || fallback.mentor.name).split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="font-bold text-base text-slate-900 mb-0.5">{src.mentor?.name || fallback.mentor.name}</div>
                <div className="text-[13px] text-slate-500">{src.mentor?.specialisation || fallback.mentor.specialisation}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Specialisation', value: src.mentor?.specialisation || fallback.mentor.specialisation },
                { label: 'Experience',     value: src.mentor?.experience || fallback.mentor.experience },
                { label: 'Email',          value: src.mentor?.email || fallback.mentor.email },
                { label: 'Phone',          value: src.mentor?.phone || fallback.mentor.phone },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-[10px] p-4">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.5px] mb-1.5">{label}</div>
                  <div className="text-[13px] font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
