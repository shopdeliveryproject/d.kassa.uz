// scripts/seed.js
// Postgres'da jadvallarni yaratadi va boshlang'ich admin foydalanuvchini qo'shadi.
// Ishga tushirish: npm run seed  (avval .env faylida POSTGRES_URL to'g'ri bo'lishi kerak)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../lib/db');

async function main() {
  console.log('→ Jadvallar tekshirilmoqda / yaratilmoqda...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      login         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name     TEXT,
      role          TEXT NOT NULL CHECK (role IN ('admin','sotuvchi','xaridor')),
      phone         TEXT,
      village       TEXT,
      created_at    TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shops (
      id          SERIAL PRIMARY KEY,
      owner_id    INTEGER NOT NULL REFERENCES users(id),
      name        TEXT NOT NULL,
      village     TEXT,
      created_at  TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      shop_id     INTEGER NOT NULL REFERENCES shops(id),
      name        TEXT NOT NULL,
      price       INTEGER NOT NULL,
      unit        TEXT DEFAULT 'dona',
      created_at  TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id          SERIAL PRIMARY KEY,
      buyer_id    INTEGER NOT NULL REFERENCES users(id),
      shop_id     INTEGER NOT NULL REFERENCES shops(id),
      total       INTEGER NOT NULL,
      status      TEXT NOT NULL DEFAULT 'jarayonda'
                  CHECK (status IN ('jarayonda','qabul_qilindi','yetkazildi','bekor_qilindi')),
      created_at  TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      login             TEXT PRIMARY KEY,
      attempt_count     INTEGER NOT NULL DEFAULT 1,
      first_attempt_at  TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  console.log('✔ Jadvallar tayyor.');

  const seedLogin = process.env.SEED_ADMIN_LOGIN || 'imradjabov';
  const seedPass  = process.env.SEED_ADMIN_PASSWORD || 'zdrrgb12';
  const seedName  = process.env.SEED_ADMIN_NAME || 'Admin';

  const existing = await pool.query('SELECT id FROM users WHERE login = $1', [seedLogin]);

  if (existing.rows.length === 0) {
    const hash = bcrypt.hashSync(seedPass, 10);
    await pool.query(
      `INSERT INTO users (login, password_hash, full_name, role) VALUES ($1, $2, $3, 'admin')`,
      [seedLogin, hash, seedName]
    );
    console.log(`✔ Admin foydalanuvchi yaratildi: ${seedLogin}`);
  } else {
    console.log("… Admin foydalanuvchi allaqachon mavjud, o'tkazib yuborildi.");
  }

  console.log('✔ Tayyor. Endi saytga kirishingiz mumkin.');
  await pool.end();
}

main().catch(err => {
  console.error('✘ Xatolik:', err);
  process.exit(1);
});
