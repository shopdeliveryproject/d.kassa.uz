// lib/respond.js
// Kichik yordamchi: JSON javob va usul (method) tekshiruvi

function json(res, status, data) {
  res.status(status).json(data);
}

function methodNotAllowed(req, res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  return json(res, 405, { error: 'Bu usul (' + req.method + ') ruxsat etilmagan.' });
}

module.exports = { json, methodNotAllowed };
