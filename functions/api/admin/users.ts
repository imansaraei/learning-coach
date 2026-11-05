// Cloudflare Pages Function: /api/admin/users
// Admin user management: List, Create, Reset Password, Delete
// Protected by hardcoded admin password: @Lambo6509

interface Env {
  USERS_KV?: any;
}

const ADMIN_PASSWORD = '@Lambo6509';
const KV_USERS_KEY = 'learning_coach_registered_users_v1';

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
  mustChangePassword: boolean;
  role: 'user' | 'admin';
}

// Simple deterministic hash for password storage (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getUsersList(env: Env): Promise<StoredUser[]> {
  if (!env.USERS_KV) return [];
  const raw = await env.USERS_KV.get(KV_USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveUsersList(env: Env, users: StoredUser[]): Promise<void> {
  if (!env.USERS_KV) return;
  await env.USERS_KV.put(KV_USERS_KEY, JSON.stringify(users));
}

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('X-Admin-Password');
  return authHeader === ADMIN_PASSWORD;
}

// GET /api/admin/users - List all users
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!verifyAdmin(request)) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid admin password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const users = await getUsersList(env);
  const sanitized = users.map(({ passwordHash, ...safe }) => safe);

  return new Response(JSON.stringify({ users: sanitized }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// POST /api/admin/users - Create new user
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!verifyAdmin(request)) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid admin password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json() as any;
    const { username, password, mustChangePassword = true } = data;

    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      return new Response(JSON.stringify({ error: 'INVALID_USERNAME', message: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return new Response(JSON.stringify({ error: 'INVALID_PASSWORD', message: 'گذرواژه باید حداقل ۴ کاراکتر باشد.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const users = await getUsersList(env);
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return new Response(JSON.stringify({ error: 'USER_EXISTS', message: 'این نام کاربری قبلاً ایجاد شده است.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      username: cleanUsername,
      passwordHash: await hashPassword(cleanPassword),
      createdAt: new Date().toISOString(),
      mustChangePassword: Boolean(mustChangePassword),
      role: 'user'
    };

    users.push(newUser);
    await saveUsersList(env, users);

    const { passwordHash: _, ...safeUser } = newUser;
    return new Response(JSON.stringify({ success: true, user: safeUser }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: err?.message || 'Failed to create user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/admin/users - Reset user password to a generic one and enforce first-login reset
export const onRequestPut = async ({ request, env }: { request: Request; env: Env }) => {
  if (!verifyAdmin(request)) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid admin password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json() as any;
    const { username, genericPassword = 'Reset@1234' } = data;

    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanPassword = String(genericPassword || '').trim();

    const users = await getUsersList(env);
    const userIndex = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);

    if (userIndex === -1) {
      return new Response(JSON.stringify({ error: 'NOT_FOUND', message: 'کاربر مورد نظر یافت نشد.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    users[userIndex].passwordHash = await hashPassword(cleanPassword);
    users[userIndex].mustChangePassword = true; // Enforce new password upon login!

    await saveUsersList(env, users);

    return new Response(JSON.stringify({
      success: true,
      message: 'گذرواژه کاربر به رمز موقت بازنشانی شد و الزام تغییر رمز فعال گردید.',
      username: cleanUsername,
      genericPassword: cleanPassword,
      mustChangePassword: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: err?.message || 'Failed to reset password' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/admin/users - Delete user
export const onRequestDelete = async ({ request, env }: { request: Request; env: Env }) => {
  if (!verifyAdmin(request)) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid admin password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username')?.trim().toLowerCase();

    if (!username) {
      return new Response(JSON.stringify({ error: 'MISSING_USERNAME', message: 'نام کاربری الزامی است.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let users = await getUsersList(env);
    users = users.filter((u) => u.username.toLowerCase() !== username);
    await saveUsersList(env, users);

    return new Response(JSON.stringify({ success: true, deletedUsername: username }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: err?.message || 'Failed to delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
