// app/room/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function WaitingRoom() {
    const { id } = useParams();
    const [room, setRoom] = useState<RoomData | null>(null);
    const [loading, setLoading] = useState(true);

    // Polling every 3s
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchRoom = async () => {
            try {
                const res = await fetch(`/api/room/${id}`);
                const data = await res.json();
                setRoom(data.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch room:', err);
            }
        };

        fetchRoom();
        interval = setInterval(fetchRoom, 3000);

        return () => clearInterval(interval);
    }, [id]);

    if (loading || !room) {
        return (
            <div className="max-w-xl mx-auto mt-20">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto mt-16 bg-background">
            <CardHeader>
                <CardTitle className="text-center text-2xl">
                    Waiting Room: <span className="text-indigo-500">{room.name}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">Join Code: <span className="font-semibold">{room.joinCode}</span></p>
            </CardHeader>

            <CardContent className="space-y-6">

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
                    <Button disabled>Waiting for players...</Button>
                </div>
            </CardContent>
        </Card>
    );
}
