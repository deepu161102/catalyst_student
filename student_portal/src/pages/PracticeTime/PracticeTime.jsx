import { Dumbbell } from 'lucide-react';

export default function PracticeTime() {
  return (
    <div className="page-content flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Dumbbell size={32} color="#4f46e5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Practice Time</h2>
        <p className="text-slate-500 text-sm">Coming soon — this will link to your practice portal.</p>
      </div>
    </div>
  );
}
