// Cloudflare Pages Function: /api/auth/change-password
// Allows user to set their new password upon first login or voluntarily

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
    const { username, oldPassword, newPassword } = data;

    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanOldPassword = String(oldPassword || '').trim();
    const cleanNewPassword = String(newPassword || '').trim();

    if (!cleanUsername || !cleanOldPassword || !cleanNewPassword) {
      return new Response(JSON.stringify({ error: 'MISSING_FIELDS', message: 'تمام فیلدها الزامی هستند.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (cleanNewPassword.length < 5) {
      return new Response(JSON.stringify({ error: 'WEAK_PASSWORD', message: 'گذرواژه جدید باید حداقل ۵ کاراکتر باشد.' }), {
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

    const userIndex = users.findIndex((u: any) => u.username.toLowerCase() === cleanUsername);
    if (userIndex === -1) {
      return new Response(JSON.stringify({ error: 'NOT_FOUND', message: 'کاربر یافت نشد.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const oldHash = await hashPassword(cleanOldPassword);
    if (users[userIndex].passwordHash !== oldHash) {
      return new Response(JSON.stringify({ error: 'INVALID_OLD_PASSWORD', message: 'گذرواژه فعلی نادرست است.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set new password and remove requirement
    users[userIndex].passwordHash = await hashPassword(cleanNewPassword);
    users[userIndex].mustChangePassword = false;

    await env.USERS_KV.put(KV_USERS_KEY, JSON.stringify(users));

    const { passwordHash: _, ...safeUser } = users[userIndex];
    return new Response(JSON.stringify({
      success: true,
      message: 'گذرواژه شما با موفقیت تغییر کرد.',
      user: safeUser
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: err?.message || 'Password update failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
