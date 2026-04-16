import { useState } from 'react';
import {
  BookOpen, Calendar, Clock, User,
  Upload, Eye, AlertCircle, CheckCircle,
} from 'lucide-react';
import { assignments as initialAssignments } from '../../data/mockData';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

const FILTERS = ['All', 'Pending', 'Submitted', 'Overdue', 'Upcoming'];

function StatusIcon({ status }) {
  if (status === 'submitted') return <CheckCircle size={16} color="#10b981" />;
  if (status === 'overdue')   return <AlertCircle size={16} color="#ef4444" />;
  return <Clock size={16} color="#f59e0b" />;
}

export default function Assignments() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [assignments, setAssignments]   = useState(initialAssignments);
  const [submitModal, setSubmitModal]   = useState(null);
  const [viewModal, setViewModal]       = useState(null);
  const [submitText, setSubmitText]     = useState('');

  const filtered =
    activeFilter === 'All'
      ? assignments
      : assignments.filter((a) => a.status.toLowerCase() === activeFilter.toLowerCase());

  const handleSubmit = () => {
    if (!submitText.trim()) return;
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === submitModal.id
          ? { ...a, status: 'submitted', submittedDate: new Date().toISOString().split('T')[0] }
          : a
      )
    );
    setSubmitModal(null);
    setSubmitText('');
  };

  return (
    <div className="page-content">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard icon={BookOpen}    count={assignments.length}                                        label="Total Assignments" colorClass="indigo" />
        <StatCard icon={Clock}       count={assignments.filter(a => a.status === 'pending').length}   label="Pending"           colorClass="amber"  />
        <StatCard icon={CheckCircle} count={assignments.filter(a => a.status === 'submitted').length} label="Submitted"         colorClass="green"  />
        <StatCard icon={AlertCircle} count={assignments.filter(a => a.status === 'overdue').length}   label="Overdue"           colorClass="red"    />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title"><BookOpen size={18} color="#4f46e5" /> Assignments</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] cursor-pointer transition-all
                ${activeFilter === f
                  ? 'border-indigo-600 bg-indigo-600/[0.06] text-indigo-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Assignment list */}
        <div className="flex flex-col gap-3.5">
          {filtered.length === 0 ? (
            <EmptyState icon={BookOpen} message="No assignments in this category." />
          ) : (
            filtered.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-[12px] px-[22px] py-5 transition-all hover:border-indigo-200 hover:shadow-[0_4px_12px_rgba(79,70,229,0.06)]"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <StatusIcon status={a.status} />
                    <span className="text-base font-bold text-slate-900">{a.title}</span>
                  </div>
                  <Badge status={a.status} />
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-3.5">{a.description}</p>

                <div className="flex items-center gap-5 text-xs text-slate-500 mb-4 flex-wrap">
                  <span className="flex items-center gap-[5px]"><Calendar size={13} /> Due: <strong>{a.dueDate}</strong></span>
                  <span className="flex items-center gap-[5px]"><Clock size={13} /> Assigned: {a.assignedDate}</span>
                  <span className="flex items-center gap-[5px]"><User size={13} /> {a.mentor}</span>
                  {a.submittedDate && (
                    <span className="flex items-center gap-[5px] text-emerald-500">
                      <CheckCircle size={13} /> Submitted: {a.submittedDate}
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button className="btn btn-outline btn-sm" onClick={() => setViewModal(a)}>
                    <Eye size={13} /> View Details
                  </button>
                  {(a.status === 'pending' || a.status === 'overdue') && (
                    <button className="btn btn-primary btn-sm" onClick={() => setSubmitModal(a)}>
                      <Upload size={13} /> Submit Assignment
                    </button>
                  )}
                  {a.status === 'submitted' && (
                    <span className="text-[13px] text-emerald-500 flex items-center gap-1">
                      <CheckCircle size={13} /> Submitted
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submit modal */}
      {submitModal && (
        <Modal
          title="Submit Assignment"
          onClose={() => setSubmitModal(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setSubmitModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Upload size={14} /> Submit
              </button>
            </>
          }
        >
          <div className="mb-4">
            <div className="text-[15px] font-bold text-slate-900 mb-1">{submitModal.title}</div>
            <div className="text-[13px] text-slate-500">Due: {submitModal.dueDate}</div>
          </div>
          <div className="flex flex-col gap-[18px]">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-[0.5px]">
                Your Submission / Notes
              </label>
              <textarea
                rows={4}
                placeholder="Describe what you've done, add links, or notes for your mentor..."
                value={submitText}
                onChange={(e) => setSubmitText(e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-sm text-slate-900 outline-none transition-all resize-y min-h-[80px] focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-[0.5px]">
                Attachment Link (optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/your-repo or drive link"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-sm text-slate-900 outline-none transition-all focus:border-indigo-600"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* View detail modal */}
      {viewModal && (
        <Modal
          title="Assignment Details"
          onClose={() => setViewModal(null)}
          maxWidth={560}
          footer={
            <button className="btn btn-outline" onClick={() => setViewModal(null)}>Close</button>
          }
        >
          <div className="flex justify-between items-start mb-4">
            <div className="text-[17px] font-bold text-slate-900 flex-1 pr-3">{viewModal.title}</div>
            <Badge status={viewModal.status} />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{viewModal.description}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Assigned By', value: viewModal.mentor },
              { label: 'Assigned On', value: viewModal.assignedDate },
              { label: 'Due Date',    value: viewModal.dueDate },
              { label: 'Status',      value: viewModal.status.charAt(0).toUpperCase() + viewModal.status.slice(1) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg px-[14px] py-2.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.5px] mb-1">{label}</div>
                <div className="text-sm font-semibold text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
