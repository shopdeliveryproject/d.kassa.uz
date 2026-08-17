// api/admin/profile.js
const bcrypt = require('bcryptjs');
const { pool } = require('../../lib/db');
const { getUserFromRequest, signToken } = require('../../lib/jwt');
const { json, methodNotAllowed } = require('../../lib/respond');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') return methodNotAllowed(req, res, ['PATCH']);

  const authUser = getUserFromRequest(req);
  if (!authUser) {
    return json(res, 401, { error: 'Token topilmadi yoki yaroqsiz.' });
  }

  const { fullName, login, currentPassword, newPassword } = req.body || {};

  if (!fullName || !login) {
    return json(res, 400, { error: "Ism familiya va login to'ldirilishi shart." });
  }
  if (!currentPassword) {
    return json(res, 400, { error: "O'zgarishlarni tasdiqlash uchun joriy parolingizni kiriting." });
  }

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [authUser.id]);
    const user = userRes.rows[0];
    if (!user) {
      return json(res, 404, { error: 'Foydalanuvchi topilmadi.' });
    }

    const passwordOk = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!passwordOk) {
      return json(res, 401, { error: 'Joriy parol noto\'g\'ri.' });
    }

    if (login !== user.login) {
      const existing = await pool.query('SELECT id FROM users WHERE login = $1 AND id != $2', [login, user.id]);
      if (existing.rows.length) {
        return json(res, 409, { error: 'Bu login band. Boshqa login tanlang.' });
      }
    }

    let newHash = user.password_hash;
    if (newPassword) {
      if (newPassword.length < 6) {
        return json(res, 400, { error: "Yangi parol kamida 6 belgidan iborat bo'lsin." });
      }
      newHash = bcrypt.hashSync(newPassword, 10);
    }

    await pool.query(
      `UPDATE users SET full_name = $1, login = $2, password_hash = $3 WHERE id = $4`,
      [fullName, login, newHash, user.id]
    );

    const token = signToken({
      id: user.id,
      login,
      role: user.role,
      full_name: fullName
    });

    return json(res, 200, {
      token,
      user: { id: user.id, login, role: user.role, full_name: fullName }
    });
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Serverda kutilmagan xatolik yuz berdi.' });
  }
};
