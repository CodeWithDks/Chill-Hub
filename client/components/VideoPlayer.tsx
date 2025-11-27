"use client";

import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Socket } from "socket.io-client";

interface VideoPlayerProps {
    url: string;
    socket: Socket | null;
    roomId: string;
    isHost?: boolean; // Not strictly used if peer-to-peer sync
}

export default function VideoPlayer({ url, socket, roomId }: VideoPlayerProps) {
    const playerRef = useRef<any>(null);
    const [playing, setPlaying] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on("video_sync", ({ type, played, timestamp, by }) => {
            if (type === "play") {
                setPlaying(true);
                if (Math.abs(playerRef.current?.getCurrentTime()! - timestamp) > 1) {
                    playerRef.current?.seekTo(timestamp);
                }
            } else if (type === "pause") {
                setPlaying(false);
                playerRef.current?.seekTo(timestamp);
            } else if (type === "seek") {
                playerRef.current?.seekTo(timestamp);
                setPlaying(played); // Keep playing state
            }
        });

        return () => {
            socket.off("video_sync");
        };
    }, [socket]);

    const handlePlay = () => {
        if (!socket) return;
        setPlaying(true);
        socket.emit("video_sync", {
            roomId,
            type: "play",
            played: true,
            timestamp: playerRef.current?.getCurrentTime()
        });
    };

    const handlePause = () => {
        if (!socket) return;
        setPlaying(false);
        socket.emit("video_sync", {
            roomId,
            type: "pause",
            played: false,
            timestamp: playerRef.current?.getCurrentTime()
        });
    };

    const handleSeek = (seconds: number) => {
        if (!socket) return;
        setIsSeeking(true);
        // We don't emit here usually, but onSeek or onBuffer
    };

    const handleSeekEnd = () => {
        if (!socket) return;
        setIsSeeking(false);
        socket.emit("video_sync", {
            roomId,
            type: "seek",
            played: playing,
            timestamp: playerRef.current?.getCurrentTime()
        });
    };

    // Cast ReactPlayer to any to avoid type issues with the url prop
    const ReactPlayerAny = ReactPlayer as any;

    return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayerAny
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                controls
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
            />
        </div>
    );
}
