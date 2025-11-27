"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface VoiceChatProps {
    roomId: string;
    socket: Socket | null;
    userId: string;
}

export default function VoiceChat({ roomId, socket, userId }: VoiceChatProps) {
    const [isJoined, setIsJoined] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});

    useEffect(() => {
        if (!socket) return;

        socket.on("user_joined_voice", (remoteUserId) => {
            createPeer(remoteUserId, socket);
        });

        socket.on("voice_offer", async ({ from, offer }) => {
            const peer = createPeerConnection(from, socket);
            peersRef.current[from] = peer;
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("voice_answer", { to: from, answer });
        });

        socket.on("voice_answer", async ({ from, answer }) => {
            const peer = peersRef.current[from];
            if (peer) {
                await peer.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on("voice_ice_candidate", async ({ from, candidate }) => {
            const peer = peersRef.current[from];
            if (peer) {
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            socket.off("user_joined_voice");
            socket.off("voice_offer");
            socket.off("voice_answer");
            socket.off("voice_ice_candidate");
        };
    }, [socket]);

    const createPeerConnection = (remoteUserId: string, socket: Socket) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("voice_ice_candidate", {
                    to: remoteUserId,
                    candidate: event.candidate,
                });
            }
        };

        peer.ontrack = (event) => {
            const audio = new Audio();
            audio.srcObject = event.streams[0];
            audio.autoplay = true;
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                peer.addTrack(track, localStreamRef.current!);
            });
        }

        return peer;
    };

    const createPeer = async (remoteUserId: string, socket: Socket) => {
        const peer = createPeerConnection(remoteUserId, socket);
        peersRef.current[remoteUserId] = peer;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("voice_offer", { to: remoteUserId, offer });
    };

    const joinVoice = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            setIsJoined(true);
            socket?.emit("join_voice", roomId);
        } catch (error) {
            console.error("Failed to get local stream", error);
        }
    };

    const leaveVoice = () => {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        Object.values(peersRef.current).forEach((peer) => peer.close());
        peersRef.current = {};
        setIsJoined(false);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks()[0].enabled = !localStreamRef.current.getAudioTracks()[0].enabled;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!isJoined ? (
                <Button onClick={joinVoice} size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Join Voice
                </Button>
            ) : (
                <>
                    <Button onClick={toggleMute} size="icon" variant={isMuted ? "destructive" : "secondary"}>
                        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button onClick={leaveVoice} size="icon" variant="destructive">
                        <PhoneOff className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
}
