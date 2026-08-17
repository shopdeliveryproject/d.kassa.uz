// api/admin/shops.js
const bcrypt = require('bcryptjs');
const { pool } = require('../../lib/db');
const { getUserFromRequest } = require('../../lib/jwt');
const { json, methodNotAllowed } = require('../../lib/respond');

module.exports = async (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return json(res, 401, { error: 'Token topilmadi yoki yaroqsiz.' });
  }
  if (user.role !== 'admin') {
    return json(res, 403, { error: "Ruxsat yo'q." });
  }

  // ---- Do'konlar ro'yxati ----
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT shops.id, shops.name, shops.village, shops.created_at,
               users.full_name AS owner_name, users.login AS owner_login
        FROM shops
        JOIN users ON users.id = shops.owner_id
        ORDER BY shops.created_at DESC
      `);
      return json(res, 200, { shops: result.rows });
    } catch (err) {
      console.error(err);
      return json(res, 500, { error: 'Serverda xatolik yuz berdi.' });
    }
  }

  // ---- Yangi do'kon (+ egasi) qo'shish ----
  if (req.method === 'POST') {
    const { shopName, village, ownerName, ownerLogin, ownerPassword } = req.body || {};

    if (!shopName || !ownerName || !ownerLogin || !ownerPassword) {
      return json(res, 400, { error: "Barcha majburiy maydonlarni to'ldiring." });
    }
    if (ownerPassword.length < 6) {
      return json(res, 400, { error: "Parol kamida 6 belgidan iborat bo'lsin." });
    }

    try {
      const existing = await pool.query('SELECT id FROM users WHERE login = $1', [ownerLogin]);
      if (existing.rows.length) {
        return json(res, 409, { error: 'Bu login band. Boshqa login tanlang.' });
      }

      const hash = bcrypt.hashSync(ownerPassword, 10);

      const ownerResult = await pool.query(
        `INSERT INTO users (login, password_hash, full_name, role, village)
         VALUES ($1, $2, $3, 'sotuvchi', $4) RETURNING id`,
        [ownerLogin, hash, ownerName, village || null]
      );
      const ownerId = ownerResult.rows[0].id;

      const shopResult = await pool.query(
        `INSERT INTO shops (owner_id, name, village)
         VALUES ($1, $2, $3) RETURNING id, name, village, created_at`,
        [ownerId, shopName, village || null]
      );

      return json(res, 201, {
        shop: {
          ...shopResult.rows[0],
          owner_name: ownerName,
          owner_login: ownerLogin
        }
      });
    } catch (err) {
      console.error(err);
      return json(res, 500, { error: 'Serverda xatolik yuz berdi.' });
    }
  }

  return methodNotAllowed(req, res, ['GET', 'POST']);
};
