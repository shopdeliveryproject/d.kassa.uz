// api/auth/me.js
const { getUserFromRequest } = require('../../lib/jwt');
const { json, methodNotAllowed } = require('../../lib/respond');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);

  const user = getUserFromRequest(req);
  if (!user) {
    return json(res, 401, { error: "Token topilmadi yoki yaroqsiz. Iltimos, tizimga kiring." });
  }

  return json(res, 200, { user });
};
