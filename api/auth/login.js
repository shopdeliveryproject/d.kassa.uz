// api/auth/login.js
const bcrypt = require('bcryptjs');
const { pool } = require('../../lib/db');
const { signToken } = require('../../lib/jwt');
const { json, methodNotAllowed } = require('../../lib/respond');

const MAX_ATTEMPTS = 6;
const WINDOW_MINUTES = 10;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  const { login, parol } = req.body || {};
  if (!login || !parol) {
    return json(res, 400, { error: 'Login va parolni kiriting.' });
  }

  try {
    // ---- urinishlarni tekshirish ----
    const attemptRes = await pool.query(
      'SELECT attempt_count, first_attempt_at FROM login_attempts WHERE login = $1',
      [login]
    );

    if (attemptRes.rows.length) {
      const { attempt_count, first_attempt_at } = attemptRes.rows[0];
      const ageMinutes = (Date.now() - new Date(first_attempt_at).getTime()) / 60000;

      if (ageMinutes > WINDOW_MINUTES) {
        await pool.query('DELETE FROM login_attempts WHERE login = $1', [login]);
      } else if (attempt_count >= MAX_ATTEMPTS) {
        return json(res, 429, { error: "Urinishlar soni ko'p. Birozdan so'ng qayta urinib ko'ring." });
      }
    }

    // ---- foydalanuvchini topish ----
    const userRes = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
    const user = userRes.rows[0];

    const registerFailure = async () => {
      await pool.query(
        `INSERT INTO login_attempts (login, attempt_count, first_attempt_at)
         VALUES ($1, 1, now())
         ON CONFLICT (login) DO UPDATE
           SET attempt_count = login_attempts.attempt_count + 1`,
        [login]
      );
    };

    if (!user) {
      await registerFailure();
      return json(res, 401, { error: 'Login yoki parol xato.' });
    }

    const ok = bcrypt.compareSync(parol, user.password_hash);
    if (!ok) {
      await registerFailure();
      return json(res, 401, { error: 'Login yoki parol xato.' });
    }

    await pool.query('DELETE FROM login_attempts WHERE login = $1', [login]);

    const token = signToken({
      id: user.id,
      login: user.login,
      role: user.role,
      full_name: user.full_name
    });

    return json(res, 200, {
      token,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Serverda kutilmagan xatolik yuz berdi.' });
  }
};
