# d.kassa.uz — GitHub + Vercel orqali joylashtirish

Bu loyiha ikki qismdan iborat, lekin **bitta** Vercel deploy'ida birga ishlaydi:
- Statik sahifalar: `index.html`, `admin-login.html`, `admin-dashboard.html`
- Backend: `api/` papkasidagi Vercel Serverless Functions
- Baza: Postgres (Vercel Storage orqali, Neon asosida — bepul tarif bor)

## 1-qadam — GitHub'ga yuklash

```bash
git init
git add .
git commit -m "d.kassa.uz — birinchi versiya"
```

GitHub'da yangi bo'sh repository yarating (masalan `dkassa-uz`), so'ng:

```bash
git remote add origin https://github.com/FOYDALANUVCHI_NOMI/dkassa-uz.git
git branch -M main
git push -u origin main
```

## 2-qadam — Vercel'ga ulash

1. [vercel.com](https://vercel.com) da GitHub hisobingiz bilan kiring.
2. **Add New → Project** → GitHub'dagi `dkassa-uz` repositoryni tanlang.
3. Framework: **Other** (avtomatik aniqlanadi) — hech narsa o'zgartirmang.
4. Hozircha **Deploy** bosmang — avval bazani ulaymiz (3-qadam), aks holda sayt xato beradi.

## 3-qadam — Postgres bazasini ulash

1. Vercel loyihangiz ichida **Storage** bo'limiga o'ting.
2. **Create Database → Postgres** (Neon asosida, bepul tarif yetarli).
3. Yaratilgach, uni loyihangizga **Connect** qiling — bu avtomatik ravishda
   `POSTGRES_URL` kabi environment variable'larni loyihangizga qo'shadi.

## 4-qadam — Boshqa environment variable'larni qo'shish

Vercel loyihangizda **Settings → Environment Variables** bo'limiga o'ting va qo'shing:

| Nomi | Qiymati |
|---|---|
| `JWT_SECRET` | uzun, tasodifiy maxfiy matn (masalan 40+ belgi) |
| `JWT_EXPIRES_IN` | `7d` |
| `SEED_ADMIN_LOGIN` | `imradjabov` |
| `SEED_ADMIN_PASSWORD` | `zdrrgb12` (keyinroq o'zgartirishingiz mumkin) |
| `SEED_ADMIN_NAME` | ismingiz |

Shundan so'ng **Deploy** tugmasini bosing.

## 5-qadam — Bazani tayyorlash (jadvallar + admin)

Bu bir martalik amal — mahalliy kompyuteringizdan bajariladi, chunki u
production bazangizga to'g'ridan-to'g'ri ulanadi:

1. Vercel'dagi **Settings → Environment Variables** dan `POSTGRES_URL`
   qiymatini nusxalab oling.
2. Loyiha papkasida `.env.example`dan nusxa oling:
   ```bash
   cp .env.example .env
   ```
3. `.env` faylini oching, `POSTGRES_URL` va boshqa qiymatlarni to'ldiring
   (xuddi Vercel'dagidek).
4. Kutubxonalarni o'rnating va seed skriptini ishga tushiring:
   ```bash
   npm install
   npm run seed
   ```
5. Konsolda "✔ Admin foydalanuvchi yaratildi" degan xabarni ko'rishingiz kerak.

## 6-qadam — Tekshirish

Vercel bergan domenni oching (masalan `dkassa-uz.vercel.app`):
- Bosh sahifada profil tanlang → **Admin**
- Login: `imradjabov`, Parol: `zdrrgb12` (yoki o'zingiz `.env`da bergan qiymat)
- Dashboard ochilib, statistika kartalari haqiqiy bazadan yuklanishi kerak.

## Keyinchalik: o'z domeningizni ulash

Vercel loyihangizda **Settings → Domains** bo'limidan `d.kassa.uz` kabi
haqiqiy domeningizni bemalol ulashingiz mumkin.

## Muhim eslatmalar

- `.env` faylini **hech qachon** GitHub'ga yubormang (`.gitignore`da allaqachon
  chiqarib tashlangan).
- `JWT_SECRET`ni ishonchli va uzun qiling — bu tokenlaringizni himoya qiladi.
- Har safar kodga o'zgartirish kiritib GitHub'ga push qilsangiz, Vercel
  avtomatik ravishda qayta joylashtiradi (CI/CD allaqachon ishlaydi).
- Sotuvchi va Xaridor panellari tayyor bo'lgach, xuddi shu `api/` papkasiga
  yangi fayllar qo'shish orqali kengaytiriladi — alohida server kerak emas.
