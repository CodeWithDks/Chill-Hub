"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { connectSocket } from "@/lib/socket";
import VideoPlayer from "@/components/VideoPlayer";
import VoiceChat from "@/components/VoiceChat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function WatchRoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { user } = useAuthStore();
    const [url, setUrl] = useState("");
    const [inputUrl, setInputUrl] = useState("");
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const s = connectSocket();
        setSocket(s);

        if (s) {
            s.emit("join_watch_room", roomId);

            s.on("video_change", ({ url, by }) => {
                setUrl(url);
                toast.info(`${by} changed the video`);
            });

            s.on("user_joined_room", ({ username }) => {
                toast.success(`${username} joined the room`);
            });
        }

        return () => {
            if (s) {
                s.emit("leave_watch_room", roomId);
                s.off("video_change");
                s.off("user_joined_room");
            }
        };
    }, [roomId]);

    const handleUrlChange = () => {
        if (!inputUrl.trim()) return;
        if (socket) {
            socket.emit("video_change", { roomId, url: inputUrl });
            setUrl(inputUrl);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Watch Room</h2>
                <div className="flex items-center gap-4">
                    {socket && user && <VoiceChat roomId={roomId} socket={socket} userId={user.id} />}
                    <div className="flex gap-2 w-full max-w-md">
                        <Input
                            placeholder="Paste video URL"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                        />
                        <Button onClick={handleUrlChange}>Load</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {url ? (
                        <VideoPlayer url={url} socket={socket} roomId={roomId} />
                    ) : (
                        <Card className="aspect-video flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">No video loaded</p>
                        </Card>
                    )}
                </div>
                <div>
                    <Card className="h-full">
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-4">Room Chat</h3>
                            <p className="text-sm text-muted-foreground">Chat feature coming soon...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
