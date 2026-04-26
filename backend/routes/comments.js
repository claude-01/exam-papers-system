const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all comments for a specific paper
router.get('/paper/:paperId', async (req, res) => {
    try {
        const paperId = req.params.paperId;
        
        const [comments] = await db.query(
            `SELECT id, user_name, user_email, comment, created_at, updated_at, is_admin_comment 
             FROM comments 
             WHERE paper_id = ? 
             ORDER BY created_at DESC`,
            [paperId]
        );
        
        res.json({
            success: true,
            data: comments
        });
        
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments',
            error: error.message
        });
    }
});

// POST a new comment
router.post('/', async (req, res) => {
    try {
        const { paper_id, user_name, user_email, comment, is_admin_comment = false } = req.body;
        
        // Validate required fields
        if (!paper_id || !user_name || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Paper ID, user name, and comment are required'
            });
        }
        
        // Validate comment length
        if (comment.length < 3 || comment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Comment must be between 3 and 1000 characters'
            });
        }
        
        const [result] = await db.query(
            `INSERT INTO comments (paper_id, user_name, user_email, comment, is_admin_comment) 
             VALUES (?, ?, ?, ?, ?)`,
            [paper_id, user_name, user_email, comment, is_admin_comment]
        );
        
        // Return the created comment
        const [newComment] = await db.query(
            `SELECT id, user_name, user_email, comment, created_at, updated_at, is_admin_comment 
             FROM comments 
             WHERE id = ?`,
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: newComment[0]
        });
        
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
});

// PUT update a comment
router.put('/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        const { comment } = req.body;
        
        // Validate comment length
        if (comment.length < 3 || comment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Comment must be between 3 and 1000 characters'
            });
        }
        
        const [result] = await db.query(
            `UPDATE comments 
             SET comment = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [comment, commentId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Return the updated comment
        const [updatedComment] = await db.query(
            `SELECT id, user_name, user_email, comment, created_at, updated_at, is_admin_comment 
             FROM comments 
             WHERE id = ?`,
            [commentId]
        );
        
        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: updatedComment[0]
        });
        
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update comment',
            error: error.message
        });
    }
});

// DELETE a comment
router.delete('/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        
        const [result] = await db.query(
            'DELETE FROM comments WHERE id = ?',
            [commentId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment',
            error: error.message
        });
    }
});

// GET comment statistics for admin dashboard
router.get('/stats/summary', async (req, res) => {
    try {
        const [totalComments] = await db.query('SELECT COUNT(*) as total FROM comments');
        const [recentComments] = await db.query(
            `SELECT c.*, p.subject, p.year 
             FROM comments c 
             JOIN exam_papers p ON c.paper_id = p.id 
             ORDER BY c.created_at DESC 
             LIMIT 5`
        );
        const [commentsByPaper] = await db.query(
            `SELECT p.subject, p.year, COUNT(c.id) as comment_count 
             FROM exam_papers p 
             LEFT JOIN comments c ON p.id = c.paper_id 
             GROUP BY p.id, p.subject, p.year 
             ORDER BY comment_count DESC 
             LIMIT 10`
        );
        
        res.json({
            success: true,
            data: {
                totalComments: totalComments[0].total,
                recentComments,
                commentsByPaper
            }
        });
        
    } catch (error) {
        console.error('Error fetching comment stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comment statistics',
            error: error.message
        });
    }
});

module.exports = router;
