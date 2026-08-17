// api/seller/stats.js
const { pool } = require('../../lib/db');
const { getUserFromRequest } = require('../../lib/jwt');
const { json, methodNotAllowed } = require('../../lib/respond');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);

  const user = getUserFromRequest(req);
  if (!user) {
    return json(res, 401, { error: 'Token topilmadi yoki yaroqsiz.' });
  }
  if (user.role !== 'sotuvchi') {
    return json(res, 403, { error: "Ruxsat yo'q." });
  }

  try {
    const shopRes = await pool.query('SELECT * FROM shops WHERE owner_id = $1 LIMIT 1', [user.id]);
    const shop = shopRes.rows[0];

    if (!shop) {
      return json(res, 200, {
        shopName: null,
        totalProducts: 0,
        totalOrders: 0,
        todayRevenue: 0
      });
    }

    const [products, orders, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM products WHERE shop_id = $1', [shop.id]),
      pool.query('SELECT COUNT(*)::int AS c FROM orders WHERE shop_id = $1', [shop.id]),
      pool.query(
        `SELECT COALESCE(SUM(total), 0)::bigint AS s FROM orders WHERE shop_id = $1 AND created_at::date = CURRENT_DATE`,
        [shop.id]
      )
    ]);

    return json(res, 200, {
      shopName: shop.name,
      totalProducts: products.rows[0].c,
      totalOrders: orders.rows[0].c,
      todayRevenue: Number(revenue.rows[0].s)
    });
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Serverda kutilmagan xatolik yuz berdi.' });
  }
};
