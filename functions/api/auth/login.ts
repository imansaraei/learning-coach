// Cloudflare Pages Function: /api/auth/login
// User authentication endpoint

interface Env {
  USERS_KV?: any;
}

const KV_USERS_KEY = 'learning_coach_registered_users_v1';

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const data = await request.json() as any;
    const { username, password } = data;

    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return new Response(JSON.stringify({ error: 'MISSING_FIELDS', message: 'نام کاربری و گذرواژه الزامی هستند.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.USERS_KV) {
      return new Response(JSON.stringify({ error: 'KV_NOT_BOUND', message: 'No KV storage available on server.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const raw = await env.USERS_KV.get(KV_USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];

    const user = users.find((u: any) => u.username.toLowerCase() === cleanUsername);
    if (!user) {
      return new Response(JSON.stringify({ error: 'INVALID_CREDENTIALS', message: 'نام کاربری یا گذرواژه اشتباه است.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const inputHash = await hashPassword(cleanPassword);
    if (user.passwordHash !== inputHash) {
      return new Response(JSON.stringify({ error: 'INVALID_CREDENTIALS', message: 'نام کاربری یا گذرواژه اشتباه است.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await env.USERS_KV.put(KV_USERS_KEY, JSON.stringify(users));

    const { passwordHash: _, ...safeUser } = user;
    return new Response(JSON.stringify({
      success: true,
      user: safeUser,
      mustChangePassword: Boolean(user.mustChangePassword)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: err?.message || 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
