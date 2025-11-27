"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Friend {
    _id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
}

interface FriendRequest {
    _id: string;
    from: {
        _id: string;
        username: string;
        avatar: string;
    };
    status: string;
}

export default function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<Friend[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchFriends = async () => {
        try {
            const res = await api.get("/friends");
            setFriends(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get("/friends/requests");
            setRequests(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await api.get(`/friends/search?q=${searchQuery}`);
            setSearchResults(res.data);
        } catch (error) {
            toast.error("Search failed");
        }
    };

    const sendRequest = async (userId: string) => {
        try {
            await api.post(`/friends/request/${userId}`);
            toast.success("Friend request sent");
            setSearchResults(prev => prev.filter(u => u._id !== userId));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    };

    const acceptRequest = async (userId: string) => {
        try {
            await api.post(`/friends/accept/${userId}`);
            toast.success("Friend request accepted");
            fetchRequests();
            fetchFriends();
        } catch (error) {
            toast.error("Failed to accept request");
        }
    };

    const rejectRequest = async (userId: string) => {
        try {
            await api.post(`/friends/reject/${userId}`);
            toast.success("Friend request rejected");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to reject request");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Friends</h2>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">My Friends</TabsTrigger>
                    <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
                    <TabsTrigger value="add">Add Friend</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {friends.map((friend) => (
                            <Card key={friend._id}>
                                <CardContent className="p-6 flex items-center space-x-4">
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
                                    <Button variant="outline" size="sm">Chat</Button>
                                </CardContent>
                            </Card>
                        ))}
                        {friends.length === 0 && (
                            <p className="text-muted-foreground col-span-full">No friends yet.</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {requests.map((req) => (
                            <Card key={req._id}>
                                <CardContent className="p-6 flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={req.from.avatar} />
                                        <AvatarFallback>{req.from.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{req.from.username}</h3>
                                        <p className="text-sm text-muted-foreground">Sent you a request</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="icon" variant="default" onClick={() => acceptRequest(req.from._id)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="outline" onClick={() => rejectRequest(req.from._id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {requests.length === 0 && (
                            <p className="text-muted-foreground col-span-full">No pending requests.</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="add" className="space-y-4">
                    <div className="flex gap-2 max-w-md">
                        <Input
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch}>
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {searchResults.map((user) => (
                            <Card key={user._id}>
                                <CardContent className="p-6 flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{user.username}</h3>
                                    </div>
                                    <Button size="sm" onClick={() => sendRequest(user._id)}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
