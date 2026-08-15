// lib/jwt.js
const jwt = require('jsonwebtoken');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Vercel serverless funksiyalarida ishlatish uchun: Authorization header'dan
// tokenni o'qiydi va tekshiradi. Muvaffaqiyatsiz bo'lsa null qaytaradi.
function getUserFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyToken, getUserFromRequest };
