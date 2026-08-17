// lib/db.js
// Postgres bilan ulanish — Supabase Postgres orqali (Database -> Connection string).
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.warn('OGOHLANTIRISH: DATABASE_URL o\'rnatilmagan. .env faylini tekshiring.');
}

// Serverless muhitda har bir funksiya chaqiruvi yangi ulanish ochmasligi uchun
// pool global obyektga saqlanadi, va ulanishlar soni past ushlab turiladi
// (Supabase'ning pooler manzili bilan ishlashda tavsiya etiladi).
const pool = global._dkassaPool || new Pool({
  connectionString,
  max: 3,
  ssl: connectionString && connectionString.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

if (process.env.NODE_ENV !== 'production') {
  global._dkassaPool = pool;
}

module.exports = { pool };
