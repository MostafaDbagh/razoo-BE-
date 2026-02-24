/**
 * Analyze controller
 * Handles face analysis requests - orchestrates upload, AI call, and DB storage
 */
const path = require('path');
const aiService = require('../services/aiService');
const orderService = require('../services/orderService');
const openaiService = require('../services/openaiService');

/**
 * POST /api/analyze
 * Accepts image upload, sends to AI service, stores result, returns recommendations
 */
async function analyze(req, res, next) {
  try {
    // Get relative path for storage - AI service receives file from backend
    const imagePath = path.join('uploads', req.file.filename);
    const absolutePath = path.join(__dirname, '../../', imagePath);

    // Call AI service for face analysis (hair_length filters to achievable styles)
    const hairLength = ['short', 'medium', 'long'].includes((req.body?.hair_length || '').toLowerCase())
      ? req.body.hair_length.toLowerCase()
      : 'short';
    const analysisResult = await aiService.analyzeFace(absolutePath, hairLength);

    // Validate AI response structure
    if (!analysisResult.face_shape || !Array.isArray(analysisResult.suggestions)) {
      throw new Error('Invalid response from AI service');
    }

    // Store analysis in database (optional - continue if DB unavailable)
    let analysisId = null;
    let createdAt = new Date().toISOString();
    try {
      const savedAnalysis = await orderService.saveAnalysis({
        userId: (() => {
          const id = parseInt(req.body?.user_id, 10);
          return Number.isInteger(id) ? id : null;
        })(),
        imagePath,
        faceShape: analysisResult.face_shape,
        confidence: analysisResult.confidence ?? 0,
        suggestions: analysisResult.suggestions,
      });
      analysisId = savedAnalysis.id;
      createdAt = savedAnalysis.created_at;
    } catch (dbErr) {
      console.warn('Could not save analysis to MongoDB:', dbErr.message);
    }

    // Optional: add OpenAI-generated summary when API key is set
    let aiSummary = null;
    if (openaiService.isAvailable()) {
      aiSummary = await openaiService.generateRecommendationSummary(
        analysisResult.face_shape,
        analysisResult.suggestions
      );
    }

    const responseData = {
      analysis_id: analysisId,
      face_shape: analysisResult.face_shape,
      confidence: analysisResult.confidence,
      suggestions: analysisResult.suggestions,
      suggestion_scores: analysisResult.suggestion_scores,
      created_at: createdAt,
      anthropometric_type: analysisResult.anthropometric_type,
      image_quality_marks: analysisResult.image_quality_marks,
      metrics: analysisResult.metrics,
    };
    if (analysisResult.annotated_image) {
      responseData.annotated_image = analysisResult.annotated_image;
    }
    if (analysisResult.message) responseData.message = analysisResult.message;
    if (aiSummary) responseData.ai_summary = aiSummary;

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    // Axios error from AI service - forward status and message
    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail || err.message;
      const error = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      error.statusCode = status;
      return next(error);
    }
    // Timeout: analysis took too long
    if (err.code === 'ETIMEDOUT' || (err.message && err.message.includes('timeout'))) {
      const error = new Error(
        'Analysis took too long. Try again with a clear, front-facing photo or ensure the AI service is running.'
      );
      error.statusCode = 504;
      return next(error);
    }
    // Network error (AI service down, connection refused)
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      const error = new Error(
        'Face analysis service is unavailable. Please ensure the AI service is running on port 8000.'
      );
      error.statusCode = 503;
      return next(error);
    }
    // Invalid response structure from AI
    if (err.message && err.message.includes('Invalid response from AI service')) {
      err.statusCode = 502;
    }
    next(err);
  }
}

module.exports = {
  analyze,
};
