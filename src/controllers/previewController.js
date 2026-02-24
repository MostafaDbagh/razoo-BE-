const aiService = require('../services/aiService');

async function hairstylePreview(req, res, next) {
  try {
    const { style } = req.params;
    if (!style || !style.trim()) return res.status(400).json({ success: false, error: 'No style provided' });
    const result = await aiService.getHairstylePreview(style.trim());
    res.json(result);
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

module.exports = { hairstylePreview };
