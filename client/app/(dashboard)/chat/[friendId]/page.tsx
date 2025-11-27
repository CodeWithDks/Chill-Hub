"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

interface Message {
    _id: string;
    from: string;
    to: string;
    content: string;
    createdAt: string;
}

interface User {
    _id: string;
    username: string;
    avatar: string;
}

export default function ChatPage() {
    const params = useParams();
    const friendId = params.friendId as string;
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [friend, setFriend] = useState<User | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/${friendId}`);
                setMessages(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchFriend = async () => {
            // Ideally we have an endpoint for single user or get from friends list
            // For now, we might not have it, but let's assume we can get it or just show ID
            // We'll skip fetching friend details for now or implement an endpoint
        };

        fetchMessages();

        const socket = connectSocket();
        if (socket) {
            socket.on("receive_message", (message: Message) => {
                if (message.from === friendId || message.to === friendId) {
                    setMessages((prev) => [...prev, message]);
                }
            });

            socket.on("message_sent", (message: Message) => {
                if (message.to === friendId) {
                    setMessages((prev) => [...prev, message]);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off("receive_message");
                socket.off("message_sent");
            }
        };
    }, [friendId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const socket = getSocket();
        if (socket) {
            socket.emit("send_message", { to: friendId, content: newMessage });
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center p-4 border-b">
                <h2 className="text-xl font-bold">Chat</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.from === user?.id;
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${isMe
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <span className="text-xs opacity-70 block mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t flex gap-2">
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
