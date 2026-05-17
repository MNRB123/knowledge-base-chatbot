const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  content: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  chunkIndex: { type: Number, required: true },
  tokenCount: { type: Number, default: 0 }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx', 'txt', 'md'], required: true },
  fileSize: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['faq', 'manual', 'policy', 'ticket', 'general'],
    default: 'general' 
  },
  language: { type: String, enum: ['en', 'hi', 'both'], default: 'en' },
  content: { type: String, required: true },
  chunks: [chunkSchema],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String, trim: true }],
  queryCount: { type: Number, default: 0 }
}, { timestamps: true });

documentSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Document', documentSchema);
