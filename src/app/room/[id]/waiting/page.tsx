'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type RoomMember = {
    id: string;
    userId: string;
    role: string;
    status: string;
    user: {
        name: string;
        username: string;
    };
};

type RoomData = {
    id: string;
    name: string;
    joinCode: string;
    status: string;
    members: RoomMember[];
};

export default function WaitingRoomPage() {
    const params = useParams();
    const router = useRouter();
    
    // Better handling of the id parameter
    const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    console.log('Room ID from params:', roomId);
    console.log('Room ID type:', typeof roomId);
    
    const [room, setRoom] = useState<RoomData | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoom = async () => {
        // More robust validation
        if (!roomId || roomId === '') {
            setError('Invalid room ID');
            setLoading(false);
            return;
        }

        console.log('Fetching room with ID:', roomId);

        try {
            setError(null); // Clear previous errors
            
            const requestBody = {
                action: "endroll",
                id: roomId,
            };
            
            console.log('Request body:', requestBody);
            console.log('Request body JSON:', JSON.stringify(requestBody));

            const res = await fetch('/api/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Error response text:', errorText);
                
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Error response JSON:', errorJson);
                    throw new Error(errorJson.error || `HTTP error! status: ${res.status}`);
                } catch (parseError) {
                    throw new Error(`HTTP error! status: ${res.status}. Response: ${errorText}`);
                }
            }

            const data = await res.json();
            console.log('Success response data:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            setRoom(data.data);
            setLoading(false);

            if (data.data?.status === 'IN_GAME') {
                router.push(`./test`);
            }
        } catch (err: any) {
            console.error('Failed to fetch room:', err);
            setError(err.message || 'Failed to fetch room data');
            setLoading(false);
        }
    };

    // Poll every 3 seconds, but only if we have a valid roomId
    useEffect(() => {
        if (roomId) {
            fetchRoom();
            const interval = setInterval(fetchRoom, 3000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
            setError('Room ID is missing from URL');
        }
    }, [roomId]); // Dependency on roomId instead of params.id

    const startGame = async () => {
        // More detailed validation and error handling
        if (!roomId || roomId === '') {
            console.error('Cannot start game: Room ID is missing');
            setError('Room ID is required to start the game');
            return;
        }

        if (starting) {
            console.log('Game start already in progress...');
            return;
        }

        console.log('Starting game for room:', roomId);
        setStarting(true);
        setError(null);
        
        try {
            const requestBody = { action: 'start', id: roomId };
            console.log('Start game request body:', requestBody);
            
            const res = await fetch(`/api/room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            
            console.log('Start game response status:', res.status);
            
            const data = await res.json();
            console.log('Start game response data:', data);
            
            if (!res.ok) {
                throw new Error(data.error || `HTTP error! status: ${res.status}`);
            }
            
            console.log('Game started successfully, redirecting...');
            router.push(`./test`);
        } catch (err: any) {
            console.error('Failed to start game:', err);
            setError(err.message || 'Failed to start the game');
        } finally {
            setStarting(false);
        }
    };

    // Early return for invalid room ID
    if (!roomId || roomId === '') {
        return (
            <div className="max-w-xl mx-auto mt-20 text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">
                    Invalid Room
                </div>
                <p className="text-muted-foreground">
                    Room ID is missing from the URL.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Debug: params = {JSON.stringify(params)}
                </p>
            </div>
        );
    }

    // Error state
    if (error && !loading) {
        return (
            <div className="max-w-xl mx-auto mt-20 text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">
                    Error
                </div>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="text-xs text-gray-500 mb-4">
                    <p>Room ID: {roomId}</p>
                    <p>Room ID type: {typeof roomId}</p>
                </div>
                <Button onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchRoom();
                }}>
                    Try Again
                </Button>
            </div>
        );
    }

    // Loading state
    if (loading || !room) {
        return (
            <div className="max-w-xl mx-auto mt-20">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-40 w-full" />
                <div className="text-xs text-gray-500 mt-2 text-center">
                    Loading room: {roomId}
                </div>
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto mt-16 bg-background">
            <CardHeader>
                <CardTitle className="text-center text-2xl">
                    Waiting Room: <span className="text-green-500">{room.name}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">
                    Join Code: <span className="font-semibold text-green-500">{room.joinCode}</span>
                </p>
                <p className="text-xs text-gray-500 text-center">
                    Room ID: {roomId}
                </p>
            </CardHeader>

            <CardContent className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}
                
                <div className="bg-muted rounded-xl p-4">
                    <h2 className="font-semibold text-lg mb-2 text-white">Players Joined:</h2>
                    <ul className="space-y-2">
                        {room.members.map((member) => (
                            <li key={member.id} className="flex items-center gap-3 text-white">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>
                                    {member.user.name || member.user.username} ({member.role})
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end">
                    {room.members.length >= 2 ? (
                        <Button 
                            onClick={startGame} 
                            disabled={starting}
                            className="min-w-[140px]"
                        >
                            {starting ? 'Starting...' : 'Start Typing Test'}
                        </Button>
                    ) : (
                        <Button disabled className="min-w-[140px]">
                            Waiting for players...
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}