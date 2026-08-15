// api/admin/stats.js
const { pool } = require('../../lib/db');
const { getUserFromRequest } = require('../../lib/jwt');
const { json, methodNotAllowed } = require('../../lib/respond');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);

  const user = getUserFromRequest(req);
  if (!user) {
    return json(res, 401, { error: 'Token topilmadi yoki yaroqsiz.' });
  }
  if (user.role !== 'admin') {
    return json(res, 403, { error: "Ruxsat yo'q." });
  }

  try {
    const [orders, sellers, buyers, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM orders'),
      pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role = 'sotuvchi'"),
      pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role = 'xaridor'"),
      pool.query(`SELECT COALESCE(SUM(total), 0)::bigint AS s FROM orders WHERE created_at::date = CURRENT_DATE`)
    ]);

    return json(res, 200, {
      totalOrders: orders.rows[0].c,
      totalSellers: sellers.rows[0].c,
      totalBuyers: buyers.rows[0].c,
      todayRevenue: Number(revenue.rows[0].s)
    });
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Serverda kutilmagan xatolik yuz berdi.' });
  }
};
