import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get chat history with a friend
router.get('/:friendId', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.params;
        const messages = await Message.find({
            $or: [
                { from: req.user.id, to: friendId },
                { from: friendId, to: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent conversations (optional, for chat list)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // This is a bit complex in Mongo, for now just return friends
        // Ideally we aggregate messages to find last message per friend
        // For simplicity, we'll just let the frontend fetch friends and then fetch last message or just open chat
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
