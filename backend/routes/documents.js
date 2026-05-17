const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Document = require('../models/Document');
const { parseDocument, getFileType } = require('../utils/parser');
const { chunkText, generateEmbedding } = require('../utils/rag');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || './uploads';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOCX, TXT, and MD files are allowed'));
  }
});

// Upload document (Admin only)
router.post('/upload', authMiddleware, adminMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { title, category, language, tags } = req.body;
    const fileType = getFileType(req.file.originalname);

    // Parse document content
    const rawContent = await parseDocument(req.file.path, fileType);
    if (!rawContent || rawContent.trim().length < 10) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Could not extract text from document.' });
    }

    // Split into chunks
    const textChunks = chunkText(rawContent);

    // Generate embeddings for each chunk
    const chunks = [];
    for (let i = 0; i < textChunks.length; i++) {
      const embedding = await generateEmbedding(textChunks[i]);
      chunks.push({
        content: textChunks[i],
        embedding,
        chunkIndex: i,
        tokenCount: textChunks[i].split(/\s+/).length
      });
    }

    // Save document
    const document = new Document({
      title: title || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      category: category || 'general',
      language: language || 'en',
      content: rawContent,
      chunks,
      uploadedBy: req.user._id,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: {
        id: document._id,
        title: document.title,
        fileType: document.fileType,
        category: document.category,
        chunksCount: chunks.length
      }
    });
  } catch (error) {
    if (req.file?.path) fs.unlinkSync(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message });
  }
});

// Get all documents
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, language, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (language) filter.language = language;
    if (search) filter.$text = { $search: search };

    const documents = await Document.find(filter)
      .select('-chunks -content')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ documents, total: documents.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found.' });

    // Delete file
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', document.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
