// server/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const {
  ZENDESK_SUBDOMAIN,
  ZENDESK_EMAIL,
  ZENDESK_API_TOKEN,
  GOOGLE_TRANSLATE_API_KEY,
  PORT,
} = process.env;

/**
 * Zendesk API 문서 검색 함수
 */
const searchDocuments = async (query) => {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/articles/search.json?query=${encodeURIComponent(
    query
  )}&locale=ko`;
  try {
    const { data } = await axios.get(url, {
      auth: {
        username: `${ZENDESK_EMAIL}/token`,
        password: ZENDESK_API_TOKEN,
      },
    });
    return data.results;
  } catch (error) {
    console.error('Error searching documents:', error.response?.data || error);
    throw error;
  }
};

// 모든 문서 가져오기
app.get('/documents', async (req, res) => {
  const { query } = req.query;
  if (!query)
    return res.status(400).json({ error: 'query parameter is required' });
  try {
    const docs = await searchDocuments(query);
    const mappedDocs = docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      body: doc.body,
      enTitle: doc.enTitle || '',
      enBody: doc.enBody || '',
      articleUrl: `https://${ZENDESK_SUBDOMAIN}.zendesk.com/hc/ko/articles/${doc.id}`,
    }));
    res.json(mappedDocs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search documents' });
  }
});

// 단일 문서 가져오기
app.get('/document', async (req, res) => {
  const { articleId } = req.query;
  if (!articleId)
    return res.status(400).json({ error: 'articleId parameter is required' });
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/ko/articles/${articleId}.json`;
  try {
    const { data } = await axios.get(url, {
      auth: {
        username: `${ZENDESK_EMAIL}/token`,
        password: ZENDESK_API_TOKEN,
      },
    });
    res.json(data.article);
  } catch (error) {
    console.error(
      'Error fetching single document:',
      error.response?.data || error
    );
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// 번역 미리보기
const translateText = async (text) => {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  const postData = { q: text, target: 'en', format: 'text' };
  try {
    const response = await axios.post(url, postData);
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error translating text:', error.response?.data || error);
    throw error;
  }
};

app.get('/translate/preview', async (req, res) => {
  const { articleId } = req.query;
  if (!articleId)
    return res.status(400).json({ error: 'articleId parameter is required' });
  try {
    const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/ko/articles/${articleId}.json`;
    const { data } = await axios.get(url, {
      auth: {
        username: `${ZENDESK_EMAIL}/token`,
        password: ZENDESK_API_TOKEN,
      },
    });
    const article = data.article;
    const translatedTitle = await translateText(article.title);
    const translatedBody = await translateText(article.body);
    res.json({ translatedTitle, translatedBody });
  } catch (error) {
    console.error(
      'Error in translation preview:',
      error.response?.data || error
    );
    res.status(500).json({ error: 'Failed to preview translation' });
  }
});

// 업로드(번역 확정)
const addTranslation = async (articleId, translatedBody, translatedTitle) => {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/articles/${articleId}/translations.json`;
  const postData = {
    translation: {
      locale: 'en-us',
      title: translatedTitle,
      body: translatedBody,
    },
  };
  try {
    const response = await axios.post(url, postData, {
      auth: {
        username: `${ZENDESK_EMAIL}/token`,
        password: ZENDESK_API_TOKEN,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error adding translation for article ${articleId}:`,
      error.response?.data || error
    );
    throw error;
  }
};

app.post('/translate/confirm', async (req, res) => {
  const { articleId, translatedBody, translatedTitle } = req.body;
  if (!articleId || !translatedBody || !translatedTitle) {
    return res.status(400).json({
      error: 'articleId, translatedBody, and translatedTitle are required',
    });
  }
  try {
    const result = await addTranslation(
      articleId,
      translatedBody,
      translatedTitle
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add translation' });
  }
});

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
