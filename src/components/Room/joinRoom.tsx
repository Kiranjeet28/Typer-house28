'use client';

import { useState } from 'react';
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

            const roomId = data?.roomId || data?.data?.id || data?.id;
            if (!roomId) throw new Error('Room ID missing in response');

            toast.success('Joined room successfully!');
            router.push(`/room/${roomId}`);
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

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
                            className="uppercase tracking-widest"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group/btn relative block h-10 w-full rounded-md bg-black font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    >
                        {loading ? 'Joining...' : 'Join Room'}
                        <BottomGradient />
                    </button>
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
