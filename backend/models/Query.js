const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  sourceDocs: [{
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    title: String,
    relevanceScore: Number,
    excerpt: String
  }],
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    helpful: Boolean,
    comment: String
  },
  responseTime: { type: Number }, // milliseconds
  tokensUsed: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);
