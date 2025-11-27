"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Friend {
    _id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
}

export default function ChatListPage() {
    const [friends, setFriends] = useState<Friend[]>([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await api.get("/friends");
                setFriends(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchFriends();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Chats</h2>
            <div className="grid gap-4">
                {friends.map((friend) => (
                    <Link key={friend._id} href={`/chat/${friend._id}`}>
                        <Card className="hover:bg-accent transition cursor-pointer">
                            <CardContent className="p-4 flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage src={friend.avatar} />
                                    <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{friend.username}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {friend.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {friends.length === 0 && (
                    <p className="text-muted-foreground">No friends to chat with. Add some friends first!</p>
                )}
            </div>
        </div>
    );
}
