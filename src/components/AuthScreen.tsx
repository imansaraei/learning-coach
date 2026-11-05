import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/auth';
import { BookOpen, Shield, KeyRound, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  onOpenAdmin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onOpenAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forced password change state
  const [pendingChangeUser, setPendingChangeUser] = useState<User | null>(null);
  const [oldPasswordForChange, setOldPasswordForChange] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و گذرواژه را وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(username.trim(), password.trim());
      if (res.success && res.user) {
        if (res.mustChangePassword) {
          // Trigger first-login password change flow
          setPendingChangeUser(res.user);
          setOldPasswordForChange(password.trim());
        } else {
          onLoginSuccess(res.user);
        }
      } else {
        setError(res.error || 'نام کاربری یا گذرواژه نادرست است.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setChangeError('لطفاً گذرواژه جدید و تکرار آن را وارد نمایید.');
      return;
    }

    if (newPassword.trim().length < 5) {
      setChangeError('گذرواژه جدید باید حداقل ۵ کاراکتر باشد.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setChangeError('تکرار گذرواژه با گذرواژه جدید همخوانی ندارد.');
      return;
    }

    if (!pendingChangeUser) return;

    setLoading(true);
    try {
      const res = await authService.changePassword(
        pendingChangeUser.username,
        oldPasswordForChange,
        newPassword.trim()
      );

      if (res.success && res.user) {
        setPendingChangeUser(null);
        onLoginSuccess(res.user);
      } else {
        setChangeError(res.error || 'خطا در تغییر گذرواژه.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden font-vazir text-right">
      {/* Background Scriptorium Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_40%,rgba(242,202,80,0.08)_0%,transparent_60%)]" />

      {/* Main Container */}
      <div className="relative w-full max-w-md bg-[#14171d]/90 backdrop-blur-md border border-outline-variant/40 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(242,202,80,0.2)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="font-garamond text-2xl sm:text-3xl font-bold text-on-surface">
            کتاب‌های جادویی
          </h1>
          <p className="font-sans text-xs text-secondary">
            ورود به کتابخانهٔ مدل‌های ذهنی و مربی تغییر رفتار
          </p>
        </div>

        {/* Phase A: Normal Login Form */}
        {!pendingChangeUser ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">
                نام کاربری
              </label>
              <input
                type="text"
                placeholder="username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-secondary/50 outline-none transition-all text-left [direction:ltr]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">
                گذرواژه
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-secondary/50 outline-none transition-all text-left [direction:ltr]"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-garamond font-bold text-base flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(242,202,80,0.3)] hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'در حال ورود...' : 'ورود به کتابخانه'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Phase B: Forced First-Time Password Change */
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 animate-in fade-in">
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-1.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>تعیین گذرواژه جدید (اولین ورود)</span>
              </span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                سلام <strong>{pendingChangeUser.username}</strong> عزیز. جهت حفظ امنیت حریم شخصی، لطفاً گذرواژه دلخواه و دائم خود را برای ورودهای بعدی مشخص کنید.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">
                گذرواژه جدید
              </label>
              <input
                type="password"
                placeholder="حداقل ۵ کاراکتر"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
                className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-secondary/50 outline-none transition-all text-left [direction:ltr]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">
                تکرار گذرواژه جدید
              </label>
              <input
                type="password"
                placeholder="تکرار رمز جدید"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-secondary/50 outline-none transition-all text-left [direction:ltr]"
              />
            </div>

            {changeError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{changeError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-garamond font-bold text-base flex items-center justify-center gap-2 shadow hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'در حال ثبت...' : 'ذخیره رمز و ورود به کتاب‌ها'}</span>
            </button>
          </form>
        )}

        {/* Footer Admin Link */}
        <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-secondary">
          <span>حساب کاربری ندارید؟ با مدیر تماس بگیرید.</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-primary hover:underline hover:text-primary/80 transition-all cursor-pointer font-medium"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ورود مدیر (Admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
