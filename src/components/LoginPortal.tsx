import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Silakan masukkan Username dan Password.');
      return;
    }

    setIsLoading(true);

    // Verify credentials
    setTimeout(() => {
      // Validate credentials requested by user:
      // Username: Admin123
      // Pass: OPR112233
      if (cleanUser === 'Admin123' && cleanPass === 'OPR112233') {
        onLoginSuccess('Admin123');
      } else {
        setIsLoading(false);
        setErrorMessage('Username atau Password salah! Periksa kembali huruf besar/kecil.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1c3842] to-[#356170] flex flex-col justify-between p-4 sm:p-6 selection:bg-teal-500 selection:text-white">
      {/* Top corporate brand label */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5 text-white/90">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-sm backdrop-blur-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] tracking-widest font-extrabold uppercase text-teal-300">
              DEPT. OPERATION & CONTROLLING
            </div>
            <div className="text-xs text-slate-300 font-medium hidden sm:block">
              Daily Report & Monitoring System
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-teal-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Portal Aman</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#356170] px-6 py-6 text-white text-center relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-teal-400/10 pointer-events-none blur-xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-emerald-400/10 pointer-events-none blur-xl" />

            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner text-teal-200">
              <Lock className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
              LOGIN SPV OPERATION
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 font-normal">
              Masuk untuk mengakses dashboard laporan harian
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-username"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#356170] hover:bg-[#2a4d59] active:bg-[#203c46] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[46px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>MASUK KE DASHBOARD</span>
                </>
              )}
            </button>

            {/* Security Session Note */}
            <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Sesi otomatis keluar jika tab / jendela web ditutup</span>
            </div>
          </form>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full max-w-md mx-auto text-center py-2 text-[11px] text-white/60">
        &copy; {new Date().getFullYear()} Operation & Controlling Department. All rights reserved.
      </div>
    </div>
  );
};
