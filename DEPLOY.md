# d.kassa.uz — GitHub + Vercel + Supabase orqali joylashtirish

Bu qo'llanma to'liq **brauzer orqali** bajariladi — kompyuteringizda Node.js,
terminal yoki boshqa dastur o'rnatish shart emas.

Loyiha uch qismdan iborat:
- **Statik sahifalar**: `index.html`, `admin-login.html`, `admin-dashboard.html`
- **Backend**: `api/` papkasidagi Vercel Serverless Functions
- **Baza va fayl saqlash**: Supabase (Postgres baza + Storage — bitta joyda)

## 1-qadam — Supabase loyihasini yaratish

1. [supabase.com](https://supabase.com) da ro'yxatdan o'ting.
2. **New Project** → nom bering, kuchli baza paroli o'rnating (eslab qoling), **Create new project**.
3. Loyiha tayyor bo'lishini kuting.

## 2-qadam — Baza ulanish manzilini olish

1. Loyihangizda yashil **"Connect"** tugmasini bosing.
2. **"Direct Connection"** kartasini tanlang.
3. **"Transaction pooler"** variantini tanlang (port `6543`, serverless uchun tavsiya etilgan).
4. Ulanish satrini nusxalang, undagi `[YOUR-PASSWORD]` qismini bazaviy parolingiz bilan almashtiring. Bu — `DATABASE_URL`.

## 3-qadam — Storage kalitlarini olish

1. **Settings → API Keys** bo'limiga o'ting.
2. **Secret keys** ostidagi `default` kalitni (ko'z belgisi bilan ochib) nusxalang. Bu — `SUPABASE_SERVICE_ROLE_KEY`.
3. **Settings → General** bo'limidan **Project URL**ni nusxalang. Bu — `SUPABASE_URL`.

## 4-qadam — Storage bucket yaratish

1. **Storage** bo'limiga o'ting.
2. **New bucket** → nomi aynan `uploads` → **Public bucket**ni yoqing → **Create bucket**.

## 5-qadam — Bazani tayyorlash (SQL Editor orqali, brauzerda)

1. Supabase loyihangizda chapdagi **"SQL Editor"** bo'limiga o'ting.
2. **"New query"** tugmasini bosing.
3. Loyihadagi `scripts/setup.sql` faylini oching, ichidagi hammasini nusxalab, shu yerga joylashtiring.
4. **"Run"** tugmasini bosing.
5. Pastda "Success" degan xabar chiqsa — baza tayyor: jadvallar yaratildi va admin foydalanuvchi (`imradjabov` / `zdrrgb12`) qo'shildi.

## 6-qadam — GitHub'ga yuklash

1. GitHub'da repository yarating (yoki mavjudidan foydalaning).
2. Repository sahifasida **"Add file" → "Upload files"**.
3. Loyiha papkasidagi barcha fayl va papkalarni sudrab tashlang.
4. **"Commit changes"**.

## 7-qadam — Vercel'da environment variable'larni sozlash

Vercel loyihangizda **Settings → Environment Variables** bo'limida quyidagilar bo'lishi kerak:

| Nomi | Qiymati |
|---|---|
| `DATABASE_URL` | 2-qadamda olingan Transaction pooler manzili |
| `SUPABASE_URL` | 3-qadamda olingan Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 3-qadamda olingan secret kalit |
| `JWT_SECRET` | uzun, tasodifiy maxfiy matn |
| `JWT_EXPIRES_IN` | `7d` |
| `SEED_ADMIN_LOGIN` | `imradjabov` |
| `SEED_ADMIN_PASSWORD` | `zdrrgb12` |

Saqlagach, **Deployments** bo'limidan oxirgi deploy'ni **Redeploy** qiling.

## 8-qadam — Tekshirish

Vercel bergan domenni oching:
- Bosh sahifada **Admin**ni tanlang
- Login: `imradjabov`, Parol: `zdrrgb12`
- Dashboard ochilib statistika ko'rinishi kerak
- **Do'konlar** bo'limida yangi do'kon qo'shib ko'ring

## Ixtiyoriy: Node.js orqali (agar xohlasangiz)

`scripts/seed.js` fayli xuddi shu ishni Node.js orqali ham bajaradi — bu
ixtiyoriy, SQL Editor usuli undan farqli o'laroq hech qanday dastur talab
qilmaydi, shuning uchun asosiy yo'l sifatida shuni tavsiya qilamiz.

## Muhim eslatmalar

- `.env` yoki parollarni **hech qachon** GitHub'ga yubormang.
- `SUPABASE_SERVICE_ROLE_KEY` maxfiy — uni faqat Vercel Environment Variables'da saqlang.
- Sotuvchi va Xaridor panellari, shuningdek mahsulot rasmlari yuklash tez orada shu tuzilmaga qo'shiladi.
