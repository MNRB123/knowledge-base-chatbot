const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Document = require('../models/Document');
const Query = require('../models/Query');
const User = require('../models/User');

const router = express.Router();

// Admin dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalDocuments,
      totalQueries,
      totalUsers,
      recentQueries,
      topDocuments,
      queryTrend
    ] = await Promise.all([
      Document.countDocuments({ isActive: true }),
      Query.countDocuments(),
      User.countDocuments(),
      Query.find().sort({ createdAt: -1 }).limit(10)
        .populate('user', 'name email').select('-sourceDocs'),
      Document.find({ isActive: true }).sort({ queryCount: -1 }).limit(5)
        .select('title category queryCount fileType'),
      Query.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ])
    ]);

    // Category breakdown
    const categoryBreakdown = await Document.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Average rating
    const avgRating = await Query.aggregate([
      { $match: { 'feedback.rating': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.rating' } } }
    ]);

    res.json({
      stats: {
        totalDocuments,
        totalQueries,
        totalUsers,
        avgRating: avgRating[0]?.avgRating?.toFixed(1) || 'N/A'
      },
      recentQueries,
      topDocuments,
      queryTrend,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all queries with filters
router.get('/queries', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, language } = req.query;
    const filter = {};
    if (language) filter.language = language;

    const queries = await Query.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Query.countDocuments(filter);
    res.json({ queries, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
