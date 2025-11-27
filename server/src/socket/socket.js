import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initializeSocket = (io) => {
    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.username} (${socket.id})`);

        // Update user status to online
        await User.findByIdAndUpdate(socket.user.id, { isOnline: true });

        // Join a room with their own user ID for private events
        socket.join(socket.user.id);

        // Broadcast online status to friends (optional optimization: only to friends)
        socket.broadcast.emit('user_online', { userId: socket.user.id });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.username}`);
            await User.findByIdAndUpdate(socket.user.id, { isOnline: false, lastActive: new Date() });
            socket.broadcast.emit('user_offline', { userId: socket.user.id });
        });

        // Chat Events
        socket.on('send_message', async (data) => {
            try {
                const { to, content } = data;

                // Save to DB
                const Message = (await import('../models/Message.js')).default;
                const newMessage = new Message({
                    from: socket.user.id,
                    to,
                    content
                });
                await newMessage.save();

                // Emit to recipient
                io.to(to).emit('receive_message', {
                    _id: newMessage._id,
                    from: socket.user.id,
                    to,
                    content,
                    createdAt: newMessage.createdAt
                });

                // Emit to sender (for confirmation)
                socket.emit('message_sent', {
                    _id: newMessage._id,
                    to,
                    content,
                    createdAt: newMessage.createdAt
                });

            } catch (error) {
                console.error('Chat error:', error);
            }
        });

        // Watch Room Events
        socket.on('join_watch_room', (roomId) => {
            socket.join(roomId);
            // Notify others in room
            socket.to(roomId).emit('user_joined_room', { userId: socket.user.id, username: socket.user.username });
        });

        socket.on('leave_watch_room', (roomId) => {
            socket.leave(roomId);
            socket.to(roomId).emit('user_left_room', { userId: socket.user.id });
        });

        socket.on('video_change', ({ roomId, url }) => {
            io.to(roomId).emit('video_change', { url, by: socket.user.username });
        });

        socket.on('video_sync', ({ roomId, type, played, timestamp }) => {
            // type: 'play', 'pause', 'seek'
            socket.to(roomId).emit('video_sync', { type, played, timestamp, by: socket.user.username });
        });

        // Voice Chat Signaling
        socket.on('join_voice', (roomId) => {
            // Notify others that a user joined voice
            socket.to(roomId).emit('user_joined_voice', socket.user.id);
        });

        socket.on('voice_offer', ({ to, offer }) => {
            io.to(to).emit('voice_offer', { from: socket.user.id, offer });
        });

        socket.on('voice_answer', ({ to, answer }) => {
            io.to(to).emit('voice_answer', { from: socket.user.id, answer });
        });

        socket.on('voice_ice_candidate', ({ to, candidate }) => {
            io.to(to).emit('voice_ice_candidate', { from: socket.user.id, candidate });
        });
    });
};
