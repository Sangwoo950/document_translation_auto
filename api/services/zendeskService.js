const axios = require('axios');

const { ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN } = process.env;

const searchDocuments = async (query) => {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/articles/search.json?query=${encodeURIComponent(
    query
  )}&locale=ko`;
  const { data } = await axios.get(url, {
    auth: {
      username: `${ZENDESK_EMAIL}/token`,
      password: ZENDESK_API_TOKEN,
    },
  });
  return data.results;
};

const getDocument = async (articleId) => {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/ko/articles/${articleId}.json`;
  const { data } = await axios.get(url, {
    auth: {
      username: `${ZENDESK_EMAIL}/token`,
      password: ZENDESK_API_TOKEN,
    },
  });
  return data.article;
};

const addTranslation = async (articleId, translatedBody, translatedTitle) => {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/articles/${articleId}/translations.json`;
  const postData = {
    translation: {
      locale: 'en-us',
      title: translatedTitle,
      body: translatedBody,
    },
  };
  const response = await axios.post(url, postData, {
    auth: {
      username: `${ZENDESK_EMAIL}/token`,
      password: ZENDESK_API_TOKEN,
    },
  });
  return response.data;
};

module.exports = {
  searchDocuments,
  getDocument,
  addTranslation,
};
