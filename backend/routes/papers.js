const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all public papers
router.get('/public', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, year, subject, level, category, trade_or_combination, file_path FROM exam_papers WHERE status = ? ORDER BY year DESC, subject ASC',
            ['active']
        );
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Error fetching papers:', err);
        res.status(500).json({ success: false, data: [] });
    }
});

module.exports = router;
