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
 * Zendesk API 문서 검색 함수 (여러 문서 검색)
 * 예: GET https://{subdomain}.zendesk.com/api/v2/help_center/articles/search.json?query={query}&locale=ko
 */
const searchDocuments = async (query) => {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/articles/search.json?query=${encodeURIComponent(
    query
  )}&locale=ko`;
  const auth = {
    auth: {
      username: `${ZENDESK_EMAIL}/token`,
      password: ZENDESK_API_TOKEN,
    },
  };
  try {
    const { data } = await axios.get(url, auth);
    return data.results;
  } catch (error) {
    console.error('Error searching documents:', error.response?.data || error);
    throw error;
  }
};

// GET /documents 엔드포인트: 쿼리 기반 문서 검색
app.get('/documents', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }
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

/**
 * GET /document 엔드포인트: 단일 문서를 조회합니다.
 * 예: GET https://{subdomain}.zendesk.com/api/v2/help_center/ko/articles/{article_id}.json
 */
app.get('/document', async (req, res) => {
  const { articleId } = req.query;
  if (!articleId) {
    return res.status(400).json({ error: 'articleId parameter is required' });
  }
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/ko/articles/${articleId}.json`;
  const auth = {
    auth: {
      username: `${ZENDESK_EMAIL}/token`,
      password: ZENDESK_API_TOKEN,
    },
  };
  try {
    const { data } = await axios.get(url, auth);
    res.json(data.article);
  } catch (error) {
    console.error(
      'Error fetching single document:',
      error.response?.data || error
    );
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

/**
 * GET /translate/preview 엔드포인트: 단일 문서의 제목과 본문을 번역합니다.
 * Zendesk API에서 단일 문서를 조회한 후, 해당 제목과 본문을 Google Translation API로 영어로 번역한 결과를 반환합니다.
 */
app.get('/translate/preview', async (req, res) => {
  const { articleId } = req.query;
  if (!articleId) {
    return res.status(400).json({ error: 'articleId parameter is required' });
  }
  try {
    const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/ko/articles/${articleId}.json`;
    const auth = {
      auth: {
        username: `${ZENDESK_EMAIL}/token`,
        password: ZENDESK_API_TOKEN,
      },
    };
    const { data } = await axios.get(url, auth);
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

/**
 * Google Cloud Translation API를 이용해 한국어 텍스트를 영어로 번역하는 함수
 */
const translateText = async (text) => {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  const data = { q: text, target: 'en', format: 'text' };

  try {
    const response = await axios.post(url, data);
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error translating text:', error.response?.data || error);
    throw error;
  }
};

/**
 * Zendesk에 영어 번역본을 업로드하여 저장하는 함수.
 * 여기서는 enTitle에 번역된 제목(translatedTitle)을, body에 번역된 본문(translatedBody)을 사용합니다.
 */
const addTranslation = async (articleId, translatedBody, translatedTitle) => {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/articles/${articleId}/translations.json`;
  const auth = {
    auth: {
      username: `${ZENDESK_EMAIL}/token`,
      password: ZENDESK_API_TOKEN,
    },
  };

  const data = {
    translation: {
      locale: 'en-us',
      title: translatedTitle,
      body: translatedBody,
    },
  };

  try {
    const response = await axios.post(url, data, auth);
    return response.data;
  } catch (error) {
    console.error(
      `Error adding translation for article ${articleId}:`,
      error.response?.data || error
    );
    throw error;
  }
};

/**
 * POST /translate/confirm 엔드포인트:
 * 프론트엔드에서 전달받은 영어 번역본과 번역된 제목을 Zendesk의 추가언어 문서로 업로드하여 저장합니다.
 */
app.post('/translate/confirm', async (req, res) => {
  const { articleId, translatedText, translatedTitle } = req.body;
  if (!articleId || !translatedText || !translatedTitle) {
    return res
      .status(400)
      .json({
        error: 'articleId, translatedText, and translatedTitle are required',
      });
  }
  try {
    const result = await addTranslation(
      articleId,
      translatedText,
      translatedTitle
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add translation' });
  }
});

// 포트 번호 선언
const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
