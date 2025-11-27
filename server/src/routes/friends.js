import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Search Users
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await User.find({
            username: { $regex: q, $options: 'i' },
            _id: { $ne: req.user.id }
        }).select('username avatar bio');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Send Friend Request
router.post('/request/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (userId === req.user.id) return res.status(400).json({ message: 'Cannot add yourself' });

        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Check if already friends
        if (targetUser.friends.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        // Check if request already sent
        const existingRequest = targetUser.friendRequests.find(
            r => r.from.toString() === req.user.id && r.status === 'pending'
        );
        if (existingRequest) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        // Check if they sent us a request (if so, maybe auto-accept? For now just allow sending back or error)
        // Actually, if they sent us a request, we should accept it instead. But let's keep it simple.

        targetUser.friendRequests.push({ from: req.user.id });
        await targetUser.save();

        res.json({ message: 'Friend request sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept Friend Request
router.post('/accept/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(req.user.id);
        const requester = await User.findById(userId);

        if (!requester) return res.status(404).json({ message: 'User not found' });

        const requestIndex = user.friendRequests.findIndex(
            r => r.from.toString() === userId && r.status === 'pending'
        );

        if (requestIndex === -1) {
            return res.status(400).json({ message: 'No pending request from this user' });
        }

        // Add to friends list for both
        user.friends.push(userId);
        requester.friends.push(req.user.id);

        // Remove request
        user.friendRequests.splice(requestIndex, 1);

        await user.save();
        await requester.save();

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject Friend Request
router.post('/reject/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(req.user.id);

        const requestIndex = user.friendRequests.findIndex(
            r => r.from.toString() === userId && r.status === 'pending'
        );

        if (requestIndex === -1) {
            return res.status(400).json({ message: 'No pending request from this user' });
        }

        user.friendRequests.splice(requestIndex, 1);
        await user.save();

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// List Friends
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username avatar isOnline lastActive');
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// List Requests
router.get('/requests', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friendRequests.from', 'username avatar');
        res.json(user.friendRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
