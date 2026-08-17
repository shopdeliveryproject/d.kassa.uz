// lib/supabase.js
// Faqat fayl/rasm saqlash (Storage) uchun ishlatiladi. Baza (Postgres) bilan
// bog'liq emas — u alohida, Vercel Postgres orqali ishlaydi.
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('OGOHLANTIRISH: SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY o\'rnatilmagan.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
