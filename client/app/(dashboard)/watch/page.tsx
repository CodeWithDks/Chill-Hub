"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

export default function WatchPage() {
    const [roomId, setRoomId] = useState("");
    const router = useRouter();

    const createRoom = () => {
        const newRoomId = uuidv4();
        router.push(`/watch/${newRoomId}`);
    };

    const joinRoom = () => {
        if (!roomId.trim()) return;
        router.push(`/watch/${roomId}`);
    };

    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Watch Together</CardTitle>
                    <CardDescription>Create a room or join a friend's room to watch videos together.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" onClick={createRoom}>
                        Create New Room
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or join existing
                            </span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Input
                            placeholder="Enter Room ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                        <Button variant="outline" onClick={joinRoom}>
                            Join
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
