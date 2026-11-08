import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/auth';
import {
  Shield,
  UserPlus,
  KeyRound,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Copy,
  AlertCircle,
  X,
  Lock,
  Sparkles,
  Users
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onUserChanged }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    authService.isAdminLoggedIn()
  );
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // User generator state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mustChangeOnFirstLogin, setMustChangeOnFirstLogin] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessSnippet, setCreateSuccessSnippet] = useState<{
    username: string;
    password: string;
    note: string;
  } | null>(null);

  // Reset password state
  const [resetTargetUser, setResetTargetUser] = useState<string | null>(null);
  const [genericPassword, setGenericPassword] = useState('Reset@1234');
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Global API Key configuration
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const isAuth = authService.isAdminLoggedIn();
      setIsAdminAuthenticated(isAuth);
      if (isAuth) {
        loadUsers();
      }
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await authService.adminGetUsers();
      setUsers(list);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    const success = authService.adminLogin(adminPasswordInput.trim());
    if (success) {
      setIsAdminAuthenticated(true);
      setAdminPasswordInput('');
      loadUsers();
    } else {
      setAdminAuthError('گذرواژه مدیر نادرست است.');
    }
  };

  const handleGenerateRandomUser = () => {
    const randomAdjectives = ['arya', 'sara', 'kiarash', 'dana', 'roham', 'vida', 'pooya', 'baran'];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const chosen = randomAdjectives[Math.floor(Math.random() * randomAdjectives.length)];
    setNewUsername(`${chosen}_${randomNum}`);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccessSnippet(null);

    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateError('لطفاً نام کاربری و گذرواژه را وارد کنید.');
      return;
    }

    const res = await authService.adminCreateUser(
      newUsername.trim(),
      newPassword.trim(),
      mustChangeOnFirstLogin
    );

    if (res.success && res.user) {
      setCreateSuccessSnippet({
        username: res.user.username,
        password: newPassword.trim(),
        note: mustChangeOnFirstLogin
          ? 'کاربر در اولین ورود ملزم به تغییر این گذرواژه خواهد بود.'
          : 'کاربر می‌تواند با این گذرواژه وارد شود.'
      });
      setNewUsername('');
      setNewPassword('');
      loadUsers();
      onUserChanged?.();
    } else {
      setCreateError(res.error || 'خطا در ایجاد کاربر');
    }
  };

  const handleResetPassword = async (username: string) => {
    const res = await authService.adminResetPassword(username, genericPassword);
    if (res.success) {
      setResetNotice(
        `گذرواژه کاربر «${username}» به «${res.genericPassword}» بازنشانی شد. کاربر در ورود بعدی موظف به تعیین رمز دلخواه جدید است.`
      );
      setResetTargetUser(null);
      loadUsers();
      onUserChanged?.();
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (window.confirm(`آیا از حذف کاربر «${username}» مطمئن هستید؟`)) {
      await authService.adminDeleteUser(username);
      loadUsers();
      onUserChanged?.();
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('اطلاعات کاربری در کلیپ‌بورد کپی شد.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overscroll-contain">
      <div className="relative w-full max-w-2xl bg-[#14171d] border border-outline-variant/40 rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto text-right font-vazir">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/30">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-garamond text-xl sm:text-2xl font-bold text-on-surface">
              پنل مدیریت کاربران (Admin Portal)
            </h2>
            <p className="text-xs font-sans text-secondary">
              تولید و مدیریت حساب‌های کاربری و بازنشانی گذرواژه‌ها
            </p>
          </div>
        </div>

        {/* --- Phase 1: Admin Password Gate --- */}
        {!isAdminAuthenticated ? (
          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 py-6 max-w-md mx-auto">
            <div className="text-center space-y-2 mb-4">
              <Lock className="w-8 h-8 text-primary mx-auto opacity-80" />
              <p className="text-xs text-secondary">
                لطفاً گذرواژه امنیتی مدیر را برای دسترسی وارد کنید.
              </p>
            </div>

            <div>
              <input
                type="password"
                placeholder="گذرواژه مدیر..."
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                autoFocus
                className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-secondary/50 outline-none transition-all text-left [direction:ltr]"
              />
              {adminAuthError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{adminAuthError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow hover:brightness-110 active:scale-[0.96] transition-[transform,filter] duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              احراز هویت و ورود به پنل
            </button>
          </form>
        ) : (
          /* --- Phase 2: Full Admin Dashboard --- */
          <div className="space-y-8">
            {/* Global API Key Configuration */}
            <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>کلید Gemini API (فعال‌سازی صوت طبیعی فارسی و مربی زنده)</span>
                </span>
                {apiKeySaved && (
                  <span className="text-[11px] text-emerald-400 font-sans flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ذخیره شد
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-surface-container-high border border-outline-variant/50 focus:border-primary rounded-lg px-3 py-1.5 text-xs text-left [direction:ltr] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-1.5 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-xs font-medium transition-all"
                >
                  ذخیره
                </button>
              </div>
            </div>

            {/* User Generator Form */}
            <div className="bg-surface-container/40 border border-outline-variant/30 rounded-xl p-5 space-y-4">
              <h3 className="font-garamond text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>تولید کاربر جدید</span>
              </h3>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-secondary font-medium">نام کاربری</label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomUser}
                        className="text-[10px] text-primary hover:underline"
                      >
                        تولید تصادفی
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="مثال: sora_72"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary rounded-lg px-3 py-2 text-xs text-left [direction:ltr] outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-secondary font-medium">گذرواژه اولیه</label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomPassword}
                        className="text-[10px] text-primary hover:underline"
                      >
                        تولید تصادفی
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="حداقل ۴ کاراکتر"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary rounded-lg px-3 py-2 text-xs text-left [direction:ltr] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="mustChange"
                    checked={mustChangeOnFirstLogin}
                    onChange={(e) => setMustChangeOnFirstLogin(e.target.checked)}
                    className="rounded border-outline-variant accent-primary cursor-pointer"
                  />
                  <label htmlFor="mustChange" className="text-xs text-secondary cursor-pointer">
                    الزام کاربر به تغییر گذرواژه در اولین ورود به برنامه (پیش‌فرض امنیتی)
                  </label>
                </div>

                {createError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{createError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-[0.96] transition-[transform,filter] duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>ثبت و تولید کاربر</span>
                </button>
              </form>

              {/* Created User Snippet Card */}
              {createSuccessSnippet && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 space-y-2 mt-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>حساب با موفقیت ایجاد شد!</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopySnippet(
                          `نام کاربری: ${createSuccessSnippet.username}\nگذرواژه موقت: ${createSuccessSnippet.password}\nآدرس: https://magicbooks.imansaraei.com`
                        )
                      }
                      className="text-xs text-emerald-300 hover:text-emerald-100 flex items-center gap-1 bg-emerald-900/50 px-2.5 py-1 rounded-md"
                    >
                      <Copy className="w-3 h-3" />
                      <span>کپی مشخصات</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-emerald-200 [direction:ltr] bg-black/40 p-2 rounded">
                    Username: <strong>{createSuccessSnippet.username}</strong> | Password:{' '}
                    <strong>{createSuccessSnippet.password}</strong>
                  </div>
                  <p className="text-[11px] text-emerald-300/80">{createSuccessSnippet.note}</p>
                </div>
              )}
            </div>

            {/* Reset Notice Banner */}
            {resetNotice && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex items-start justify-between gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>گذرواژه با موفقیت ریست شد</span>
                  </span>
                  <p className="text-xs text-amber-200/90">{resetNotice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setResetNotice(null)}
                  className="text-amber-400 hover:text-amber-200 text-xs shrink-0"
                >
                  بستن
                </button>
              </div>
            )}

            {/* Registered Users List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-garamond text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>فهرست کاربران ثبت‌شده ({users.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="text-xs text-secondary hover:text-primary flex items-center gap-1 transition-all"
                >
                  <RotateCcw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                  <span>به‌روزرسانی</span>
                </button>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-8 text-xs text-secondary bg-surface-container/20 rounded-xl border border-outline-variant/20">
                  هنوز هیچ کاربری ایجاد نشده است. از فرم بالا برای ثبت اولین کاربر استفاده کنید.
                </div>
              ) : (
                <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-surface-container-high/60 text-secondary border-b border-outline-variant/30">
                      <tr>
                        <th className="py-2.5 px-3 font-medium">نام کاربری</th>
                        <th className="py-2.5 px-3 font-medium">وضعیت گذرواژه</th>
                        <th className="py-2.5 px-3 font-medium">تاریخ ایجاد</th>
                        <th className="py-2.5 px-3 font-medium text-left">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-container/30 transition-all">
                          <td className="py-2.5 px-3 font-mono font-bold text-on-surface [direction:ltr] text-right">
                            {u.username}
                          </td>
                          <td className="py-2.5 px-3">
                            {u.mustChangePassword ? (
                              <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-600/30 px-2 py-0.5 rounded-full">
                                نیاز به تغییر رمز
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-600/30 px-2 py-0.5 rounded-full">
                                فعال و امن
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-secondary text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="py-2.5 px-3 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Reset Password Button */}
                              <button
                                type="button"
                                onClick={() => setResetTargetUser(u.username)}
                                className="p-1.5 rounded-md hover:bg-amber-950/40 text-secondary hover:text-amber-400 transition-all"
                                title="بازنشانی گذرواژه به رمز موقت"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.username)}
                                className="p-1.5 rounded-md hover:bg-rose-950/40 text-secondary hover:text-rose-400 transition-all"
                                title="حذف کاربر"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Reset Password Confirmation Dialog */}
            {resetTargetUser && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-[#181b22] border border-amber-500/40 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <KeyRound className="w-4 h-4" />
                    <span>بازنشانی گذرواژه: {resetTargetUser}</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    با بازنشانی گذرواژه، رمز عبور موقت برای این کاربر فعال می‌شود و در ورود بعدی موظف به تعیین رمز شخصی جدید خواهد بود.
                  </p>
                  <div>
                    <label className="text-[11px] text-secondary mb-1 block">گذرواژه موقت پیشنهادی:</label>
                    <input
                      type="text"
                      value={genericPassword}
                      onChange={(e) => setGenericPassword(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-mono text-left [direction:ltr] outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetTargetUser(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-secondary hover:bg-surface-container"
                    >
                      انصراف
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetPassword(resetTargetUser)}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                    >
                      تایید بازنشانی
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
