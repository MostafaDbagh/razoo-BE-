/**
 * OpenAI service - generates personalized haircut recommendations
 * Only active when OPENAI_API_KEY is set
 */
const OpenAI = require('openai');
const config = require('../config');

let client = null;
if (config.openai.apiKey) {
  client = new OpenAI({ apiKey: config.openai.apiKey });
}

/**
 * Generate a short, personalized recommendation summary based on face shape and hairstyles
 * @param {string} faceShape - Detected face shape
 * @param {string[]} suggestions - Recommended hairstyles
 * @returns {Promise<string|null>} AI-generated summary or null if OpenAI unavailable
 */
async function generateRecommendationSummary(faceShape, suggestions) {
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional stylist. Write 1-2 short, friendly sentences about why these hairstyles suit this face shape. Be concise and encouraging.',
        },
        {
          role: 'user',
          content: `Face shape: ${faceShape}. Top suggestions: ${suggestions.slice(0, 4).join(', ')}.`,
        },
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('OpenAI summary failed:', err.message);
    return null;
  }
}

module.exports = {
  generateRecommendationSummary,
  isAvailable: () => !!client,
};
