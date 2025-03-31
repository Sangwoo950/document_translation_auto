const zendeskService = require('../services/zendeskService');

const getSingleDocument = async (req, res) => {
  console.log('getSingleDocument 호출됨. articleId:', req.query.articleId);
  const { articleId } = req.query;
  if (!articleId) {
    return res.status(400).json({ error: 'articleId parameter is required' });
  }
  try {
    const article = await zendeskService.getDocument(articleId);
    res.json(article);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

module.exports = {
  getSingleDocument,
};
