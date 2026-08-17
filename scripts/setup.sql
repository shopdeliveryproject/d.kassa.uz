-- ============================================================
-- d.kassa.uz — Bazani tayyorlash skripti
-- Bu faylni Supabase loyihangizda "SQL Editor" bo'limiga
-- to'liq nusxalab, "Run" tugmasini bosing. Node.js yoki
-- terminal kerak emas — hammasi shu yerda, brauzerda bajariladi.
-- ============================================================

-- Parolni xeshlash uchun (bcrypt bilan bir xil algoritm)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Jadvallar ----------
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

CREATE TABLE IF NOT EXISTS shops (
  id          SERIAL PRIMARY KEY,
  owner_id    INTEGER NOT NULL REFERENCES users(id),
  name        TEXT NOT NULL,
  village     TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  shop_id     INTEGER NOT NULL REFERENCES shops(id),
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL,
  unit        TEXT DEFAULT 'dona',
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  buyer_id    INTEGER NOT NULL REFERENCES users(id),
  shop_id     INTEGER NOT NULL REFERENCES shops(id),
  total       INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'jarayonda'
              CHECK (status IN ('jarayonda','qabul_qilindi','yetkazildi','bekor_qilindi')),
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  login             TEXT PRIMARY KEY,
  attempt_count     INTEGER NOT NULL DEFAULT 1,
  first_attempt_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------- Boshlang'ich admin ----------
-- Login: imradjabov   Parol: zdrrgb12
-- (Parolni keyinroq o'zgartirmoqchi bo'lsangiz, shu faylning
-- oxiridagi izohga qarang.)
INSERT INTO users (login, password_hash, full_name, role)
VALUES (
  'imradjabov',
  crypt('zdrrgb12', gen_salt('bf', 10)),
  'Imran Radjabov',
  'admin'
)
ON CONFLICT (login) DO NOTHING;

-- ============================================================
-- Tayyor! Endi saytga kirib, Admin -> imradjabov / zdrrgb12
-- bilan login qilib ko'rishingiz mumkin.
-- ============================================================

-- Parolni boshqa qiymatga o'zgartirmoqchi bo'lsangiz, pastdagi
-- qatorni ('YANGI_PAROL' qismini o'zgartirib) alohida ishga tushiring:
-- UPDATE users SET password_hash = crypt('YANGI_PAROL', gen_salt('bf', 10)) WHERE login = 'imradjabov';
