const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const Document = require('../models/Document');
const Query = require('../models/Query');
const { generateEmbedding, retrieveRelevantChunks, generateAnswer } = require('../utils/rag');

const router = express.Router();

// Main chat endpoint with RAG
router.post('/query', authMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { question, sessionId, language = 'en' } = req.body;
    if (!question || question.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a valid question.' });
    }

    // Step 1: Generate embedding for the question
    const queryEmbedding = await generateEmbedding(question);
    if (!queryEmbedding.length) {
      return res.status(500).json({ error: 'Failed to process your question. Please try again.' });
    }

    // Step 2: Load all active documents with chunks
    const documents = await Document.find({ isActive: true }).select('_id title chunks category');

    if (!documents.length) {
      return res.json({
        answer: language === 'hi'
          ? 'माफ़ करें, अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया है। कृपया एडमिन से संपर्क करें।'
          : 'No knowledge base documents found yet. Please contact the admin to upload documents.',
        sources: [],
        sessionId: sessionId || uuidv4()
      });
    }

    // Step 3: Retrieve relevant chunks (semantic search)
    const relevantChunks = retrieveRelevantChunks(queryEmbedding, documents, 5);

    // Step 4: Build context from top chunks
    const context = relevantChunks
      .filter(c => c.score > 0.7) // Only include sufficiently relevant chunks
      .map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.content}`)
      .join('\n\n---\n\n');

    if (!context.trim()) {
      const fallback = language === 'hi'
        ? 'माफ़ करें, इस प्रश्न का उत्तर हमारे नॉलेज बेस में नहीं मिला। कृपया अपना प्रश्न अलग तरीके से पूछें या सपोर्ट टीम से संपर्क करें।'
        : 'Sorry, I could not find relevant information for your question in the knowledge base. Please rephrase your question or contact support.';
      return res.json({ answer: fallback, sources: [], sessionId: sessionId || uuidv4() });
    }

    // Step 5: Generate answer with GPT
    const { answer, tokensUsed } = await generateAnswer(question, context, language);

    // Step 6: Prepare source documents info
    const sources = relevantChunks.slice(0, 3).map(c => ({
      docId: c.docId,
      title: c.title,
      relevanceScore: Math.round(c.score * 100),
      excerpt: c.content.slice(0, 200) + '...'
    }));

    const currentSessionId = sessionId || uuidv4();
    const responseTime = Date.now() - startTime;

    // Step 7: Save query to DB
    const query = new Query({
      user: req.user._id,
      sessionId: currentSessionId,
      question,
      answer,
      language,
      sourceDocs: sources,
      responseTime,
      tokensUsed
    });
    await query.save();

    // Update document query count
    const uniqueDocIds = [...new Set(relevantChunks.map(c => c.docId.toString()))];
    await Document.updateMany(
      { _id: { $in: uniqueDocIds } },
      { $inc: { queryCount: 1 } }
    );

    res.json({ answer, sources, sessionId: currentSessionId, responseTime });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate answer. Please try again.' });
  }
});

// Submit feedback for a query
router.post('/feedback/:queryId', authMiddleware, async (req, res) => {
  try {
    const { rating, helpful, comment } = req.body;
    await Query.findByIdAndUpdate(req.params.queryId, {
      feedback: { rating, helpful, comment }
    });
    res.json({ message: 'Feedback submitted. Thank you!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for session
router.get('/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    const queries = await Query.find({
      sessionId: req.params.sessionId,
      user: req.user._id
    }).sort({ createdAt: 1 }).limit(50);
    res.json({ history: queries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
