import { User } from '../types/auth';

const ADMIN_PASSWORD = '@Lambo6509';
const STORAGE_CURRENT_USER = 'learning_coach_current_user_v1';
const STORAGE_IS_ADMIN = 'learning_coach_is_admin_v1';
const LOCAL_USERS_KEY = 'learning_coach_local_users_fallback_v1';

interface LocalUserRecord extends User {
  passwordHash: string;
}

// Simple in-browser SHA-256 hash helper
async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUserRecord[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local users fallback:', e);
  }
}

class AuthService {
  public getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  }

  public isAdminLoggedIn(): boolean {
    return sessionStorage.getItem(STORAGE_IS_ADMIN) === 'true';
  }

  public adminLogin(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_IS_ADMIN, 'true');
      return true;
    }
    return false;
  }

  public adminLogout(): void {
    sessionStorage.removeItem(STORAGE_IS_ADMIN);
  }

  // --- Admin API operations ---

  public async adminGetUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'X-Admin-Password': ADMIN_PASSWORD }
      });
      if (res.ok) {
        const data = await res.json() as any;
        if (Array.isArray(data.users)) {
          // Sync to local fallback
          return data.users;
        }
      }
    } catch (e) {
      console.warn('Backend admin users unreachable, using local fallback:', e);
    }

    // Fallback to local storage
    const locals = getLocalUsers();
    return locals.map(({ passwordHash: _, ...u }) => u);
  }

  public async adminCreateUser(
    username: string,
    password: string,
    mustChangePassword: boolean = true
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': ADMIN_PASSWORD
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          mustChangePassword
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        return { success: true, user: data.user };
      } else {
        const err = await res.json() as any;
        if (err.error !== 'KV_NOT_BOUND') {
          return { success: false, error: err.message || 'خطا در ایجاد کاربر' };
        }
      }
    } catch (e) {
      console.warn('Using local fallback for user creation:', e);
    }

    // Local fallback
    const locals = getLocalUsers();
    if (locals.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'این نام کاربری قبلاً ایجاد شده است.' };
    }

    const newUser: LocalUserRecord = {
      id: crypto.randomUUID(),
      username: cleanUsername,
      passwordHash: await sha256(cleanPassword),
      createdAt: new Date().toISOString(),
      mustChangePassword,
      role: 'user'
    };

    locals.push(newUser);
    saveLocalUsers(locals);

    const { passwordHash: _, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  }

  public async adminResetPassword(
    username: string,
    genericPassword: string = 'Reset@1234'
  ): Promise<{ success: boolean; genericPassword?: string; error?: string }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = genericPassword.trim();

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': ADMIN_PASSWORD
        },
        body: JSON.stringify({
          username: cleanUsername,
          genericPassword: cleanPassword
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        return { success: true, genericPassword: data.genericPassword || cleanPassword };
      }
    } catch (e) {
      console.warn('Using local fallback for password reset:', e);
    }

    // Local fallback
    const locals = getLocalUsers();
    const idx = locals.findIndex((u) => u.username.toLowerCase() === cleanUsername);
    if (idx === -1) {
      return { success: false, error: 'کاربر یافت نشد.' };
    }

    locals[idx].passwordHash = await sha256(cleanPassword);
    locals[idx].mustChangePassword = true;
    saveLocalUsers(locals);

    return { success: true, genericPassword: cleanPassword };
  }

  public async adminDeleteUser(username: string): Promise<boolean> {
    const cleanUsername = username.trim().toLowerCase();
    try {
      const res = await fetch(`/api/admin/users?username=${encodeURIComponent(cleanUsername)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': ADMIN_PASSWORD }
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Using local fallback for delete user:', e);
    }

    let locals = getLocalUsers();
    locals = locals.filter((u) => u.username.toLowerCase() !== cleanUsername);
    saveLocalUsers(locals);
    return true;
  }

  // --- User Login & Password operations ---

  public async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: User; mustChangePassword?: boolean; error?: string }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });

      if (res.ok) {
        const data = await res.json() as any;
        this.setCurrentUser(data.user);
        return {
          success: true,
          user: data.user,
          mustChangePassword: Boolean(data.mustChangePassword)
        };
      } else {
        const err = await res.json() as any;
        if (err.error !== 'KV_NOT_BOUND') {
          return { success: false, error: err.message || 'نام کاربری یا گذرواژه نادرست است.' };
        }
      }
    } catch (e) {
      console.warn('Backend login unreachable, trying local fallback:', e);
    }

    // Local fallback
    const locals = getLocalUsers();
    const user = locals.find((u) => u.username.toLowerCase() === cleanUsername);
    if (!user) {
      return { success: false, error: 'نام کاربری یا گذرواژه اشتباه است.' };
    }

    const inputHash = await sha256(cleanPassword);
    if (user.passwordHash !== inputHash) {
      return { success: false, error: 'نام کاربری یا گذرواژه اشتباه است.' };
    }

    user.lastLogin = new Date().toISOString();
    saveLocalUsers(locals);

    const { passwordHash: _, ...safeUser } = user;
    this.setCurrentUser(safeUser);

    return {
      success: true,
      user: safeUser,
      mustChangePassword: Boolean(user.mustChangePassword)
    };
  }

  public async changePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          oldPassword: cleanOld,
          newPassword: cleanNew
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        this.setCurrentUser(data.user);
        return { success: true, user: data.user };
      } else {
        const err = await res.json() as any;
        if (err.error !== 'KV_NOT_BOUND') {
          return { success: false, error: err.message || 'خطا در تغییر گذرواژه' };
        }
      }
    } catch (e) {
      console.warn('Backend change-password unreachable, using local fallback:', e);
    }

    // Local fallback
    const locals = getLocalUsers();
    const idx = locals.findIndex((u) => u.username.toLowerCase() === cleanUsername);
    if (idx === -1) {
      return { success: false, error: 'کاربر یافت نشد.' };
    }

    const oldHash = await sha256(cleanOld);
    if (locals[idx].passwordHash !== oldHash) {
      return { success: false, error: 'گذرواژه فعلی نادرست است.' };
    }

    locals[idx].passwordHash = await sha256(cleanNew);
    locals[idx].mustChangePassword = false;
    saveLocalUsers(locals);

    const { passwordHash: _, ...safeUser } = locals[idx];
    this.setCurrentUser(safeUser);

    return { success: true, user: safeUser };
  }

  public logout(): void {
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
