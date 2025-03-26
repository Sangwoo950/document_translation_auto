const axios = require('axios');
const zendeskService = require('../services/zendeskService');

const {
  GOOGLE_TRANSLATE_API_KEY,
  ZENDESK_SUBDOMAIN,
  ZENDESK_EMAIL,
  ZENDESK_API_TOKEN,
} = process.env;

const translateText = async (text) => {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  const postData = { q: text, target: 'en', format: 'text' };
  const response = await axios.post(url, postData);
  return response.data.data.translations[0].translatedText;
};

const previewTranslation = async (req, res) => {
  const { articleId } = req.query;
  if (!articleId)
    return res.status(400).json({ error: 'articleId parameter is required' });
  try {
    const article = await zendeskService.getDocument(articleId);
    const translatedTitle = await translateText(article.title);
    const translatedBody = await translateText(article.body);
    res.json({ translatedTitle, translatedBody });
  } catch (error) {
    res.status(500).json({ error: 'Failed to preview translation' });
  }
};

const confirmTranslation = async (req, res) => {
  const { articleId, translatedBody, translatedTitle } = req.body;
  if (!articleId || !translatedBody || !translatedTitle)
    return res.status(400).json({
      error: 'articleId, translatedBody, and translatedTitle are required',
    });
  try {
    const result = await zendeskService.addTranslation(
      articleId,
      translatedBody,
      translatedTitle
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add translation' });
  }
};

module.exports = {
  previewTranslation,
  confirmTranslation,
};
