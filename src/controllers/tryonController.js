const path = require('path');
const aiService = require('../services/aiService');

async function status(req, res, next) {
  try {
    const data = await aiService.getTryonStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function generate(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image provided' });
    const style = (req.body?.style || '').trim();
    if (!style) return res.status(400).json({ success: false, error: 'No style provided' });
    const absolutePath = path.join(__dirname, '../../', path.join('uploads', req.file.filename));
    const result = await aiService.generateTryon(absolutePath, style);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail || err.message;
      const error = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      error.statusCode = status;
      return next(error);
    }
    next(err);
  }
}

module.exports = { status, generate };
