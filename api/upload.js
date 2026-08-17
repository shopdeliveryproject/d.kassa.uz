// api/upload.js
// Umumiy fayl/rasm yuklash endpointi. Hozircha do'kon va mahsulot rasmlari
// uchun ishlatiladi. Supabase Storage'ga yuklaydi va ochiq (public) URL qaytaradi.
const { getUserFromRequest } = require('../lib/jwt');
const { supabase } = require('../lib/supabase');
const { json, methodNotAllowed } = require('../lib/respond');

const BUCKET = 'uploads';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

module.exports = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  const user = getUserFromRequest(req);
  if (!user) {
    return json(res, 401, { error: 'Token topilmadi yoki yaroqsiz.' });
  }

  const { fileName, fileBase64, folder } = req.body || {};
  if (!fileName || !fileBase64) {
    return json(res, 400, { error: "Fayl ma'lumotlari to'liq emas." });
  }

  try {
    const match = fileBase64.match(/^data:(.+);base64,(.+)$/);
    const contentType = match ? match[1] : 'image/jpeg';
    const base64Data = match ? match[2] : fileBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_BYTES) {
      return json(res, 400, { error: "Fayl hajmi 5 MB dan katta bo'lmasin." });
    }
    if (!contentType.startsWith('image/')) {
      return json(res, 400, { error: 'Faqat rasm fayllari yuklanadi.' });
    }

    const safeFolder = (folder || 'umumiy').replace(/[^a-z0-9_-]/gi, '');
    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${safeFolder}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET)
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error(uploadError);
      return json(res, 500, { error: 'Fayl yuklashda xatolik yuz berdi.' });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return json(res, 200, { url: data.publicUrl, path });
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Serverda kutilmagan xatolik yuz berdi.' });
  }
};
