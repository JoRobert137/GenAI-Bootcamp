const express = require('express');
const router = express.Router();
const {
  handleLawBotQuery,
  handleRAGLawBotQuery
} = require('../Controller/lawbotController');

// Original endpoint (keep for compatibility)
router.post('/', handleLawBotQuery);

// New RAG endpoint
router.post('/rag', handleRAGLawBotQuery);

// Get available laws (for debugging)
router.get('/laws', (req, res) => {
  const lawsData = require('../data/laws.json');
  res.json({
    totalLaws: lawsData.legalDocuments.length,
    laws: lawsData.legalDocuments.map(law => ({
      title: law.title,
      category: law.category
    }))
  });
});

module.exports = router;