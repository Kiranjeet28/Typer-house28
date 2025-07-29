'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShineBorder } from "@/components/magicui/shine-border";

export default function JoinRoom() {
    const router = useRouter();
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup polling on component unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const checkRoomStatus = async (roomId: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/room?id=${roomId}&action=check-join`, {
                method: 'GET',
            });

            if (!res.ok) {
                throw new Error('Failed to check room status');
            }

            const data = await res.json();
            return data === true || data.result === true;
        } catch (error) {
            console.error('Error checking room status:', error);
            return false;
        }
    };

    const startPolling = (roomId: string) => {
        console.log('Starting polling for room:', roomId);
        
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const isReady = await checkRoomStatus(roomId);
                
                if (isReady) {
                    console.log('Room is ready, navigating to test route');
                    
                    // Clear polling
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                    
                    // Reset states
                    setWaiting(false);
                    setLoading(false);
                    
                    // Navigate to test route
                    toast.success('Game is starting!');
                    router.push(`/room/${roomId}/test`);
                }
            } catch (error) {
                console.error('Polling error:', error);
                // Continue polling even if there's an error
            }
        }, 500); // Poll every 500ms
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setWaiting(false);
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) {
            toast.warning('Please enter a room code.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'join',
                    joinCode: joinCode.trim().toUpperCase(),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to join room');

            const joinedRoomId = data?.roomId || data?.data?.id || data?.id;
            if (!joinedRoomId) throw new Error('Room ID missing in response');

            // Successfully joined, now start waiting and polling
            setRoomId(joinedRoomId);
            setLoading(false);
            setWaiting(true);
            
            toast.success('Joined room successfully! Waiting for game to start...');
            
            // Start polling for room status
            startPolling(joinedRoomId);

        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
            setLoading(false);
        }
    };

    const handleCancelWaiting = () => {
        stopPolling();
        setRoomId(null);
        toast.info('Stopped waiting for game to start');
    };

    const getButtonText = () => {
        if (loading) return 'Joining...';
        if (waiting) return 'Waiting for game to start...';
        return 'Join Room';
    };

    const isButtonDisabled = loading || waiting;

    return (
        <Card className="relative overflow-hidden max-w-[350px] w-full">
            <ShineBorder shineColor={["#22D3EE", "#22C55E", "#2563EB"]} />
            <CardHeader>
                <CardTitle className="text-center text-2xl text-green-300">Join a Room</CardTitle>
            </CardHeader>
            <CardContent>
                <ShineBorder shineColor={["#22D3EE", "#22C55E", "#2563EB"]} />
                <form onSubmit={handleJoin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="joinCode">Enter Room Code</Label>
                        <Input
                            id="joinCode"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="e.g. 9GDF4G"
                            maxLength={6}
                            required
                            disabled={waiting}
                            className="uppercase tracking-widest"
                        />
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isButtonDisabled}
                            className={`group/btn relative block h-10 w-full rounded-md font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] ${
                                isButtonDisabled 
                                    ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                                    : 'bg-black hover:bg-gray-900'
                            }`}
                        >
                            {getButtonText()}
                            {!isButtonDisabled && <BottomGradient />}
                        </button>
                        
                        {waiting && (
                            <button
                                type="button"
                                onClick={handleCancelWaiting}
                                className="w-full h-8 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel Waiting
                            </button>
                        )}
                    </div>

                    {waiting && (
                        <div className="text-center text-sm text-gray-400">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                                <span>Waiting for host to start the game...</span>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

export const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-green-600 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};