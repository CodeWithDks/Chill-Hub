import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        const token = useAuthStore.getState().token;
        if (token) {
            socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
                auth: { token },
                autoConnect: false
            });
        }
    }
    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    if (s && !s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
