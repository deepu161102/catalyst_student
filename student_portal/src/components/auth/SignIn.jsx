import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/api';
import catalystLogo from '../../assets/catalyst-logo.png';

export default function SignIn({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(form.email, form.password);
      onLogin(res.data); // cookie is set automatically by the server
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-[60px] text-white">
          <div className="flex items-center mb-6">
            <img src={catalystLogo} alt="Catalyst" className="h-11 w-auto object-contain" />
          </div>

          <div className="mb-6">
            <h2 className="text-[42px] font-bold leading-tight mb-4 text-white">
              Learn. Grow. Succeed.
            </h2>
            <p className="text-base text-slate-400 leading-relaxed max-w-[400px]">
              Your personalized learning portal to track progress, connect with
              mentors, and achieve your goals.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              'Track your assignments and sessions in real-time',
              'Book one-on-one slots with your mentor',
              'Chat directly with your mentor anytime',
              'Monitor your course progress effortlessly',
            ].map((feat) => (
                <div className="flex items-center gap-3 text-[#cbd5e1] text-[15px]" key={feat}>
                  <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                  {feat}
                </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[480px] bg-white flex flex-col justify-center px-12 py-[60px]">
          <div className="mb-9">
            <h2 className="text-[28px] font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to your student portal to continue learning</p>
          </div>

          {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-[14px] py-[10px] rounded-lg text-[13px] mb-4">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-[0.5px]">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full pl-11 pr-4 py-3 border-[1.5px] border-slate-200 rounded-[10px] text-[15px] text-slate-900 outline-none bg-slate-50 transition-all focus:border-indigo-500 focus:bg-white focus:ring-[3px] focus:ring-indigo-600/10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-[0.5px]">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full pl-11 pr-11 py-3 border-[1.5px] border-slate-200 rounded-[10px] text-[15px] text-slate-900 outline-none bg-slate-50 transition-all focus:border-indigo-500 focus:bg-white focus:ring-[3px] focus:ring-indigo-600/10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-[13px] bg-gradient-to-br from-indigo-600 to-violet-500 text-white border-none rounded-[10px] text-[15px] font-semibold mt-2 cursor-pointer transition-all hover:opacity-[0.92] hover:-translate-y-px active:translate-y-0 disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-[13px] text-slate-400">
            <p className="mb-1.5">
              Demo: <strong>arjun.mehta@example.com</strong> / <strong>student123</strong>
            </p>
            <p>Having trouble? Contact your operations team.</p>
          </div>
        </div>
      </div>
  );
}