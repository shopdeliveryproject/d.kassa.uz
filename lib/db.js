// lib/db.js
// Postgres bilan ulanish (Vercel Postgres / Neon / boshqa har qanday Postgres bilan ishlaydi)
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('OGOHLANTIRISH: POSTGRES_URL o\'rnatilmagan. .env faylini tekshiring.');
}

const pool = global._dkassaPool || new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

// Serverless muhitda funksiyalar orasida ulanishni qayta ishlatish uchun
if (process.env.NODE_ENV !== 'production') {
  global._dkassaPool = pool;
}

module.exports = { pool };
