'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner'; // optional: for notifications

export default function CreateRoomForm() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        description: '',
        maxPlayers: '4',
        isPrivate: false,
        gameMode: 'SPEED_TEST',
        textLength: 'MEDIUM',
        timeLimit: '60',
        customText: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', ...form }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create room');
            }

            toast.success('Room created successfully!');
            router.push(`/room/${data.roomId}`);
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto mt-12 bg-background border border-border">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Create a Room</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name">Room Name</Label>
                        <Input name="name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input name="description" value={form.description} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxPlayers">Max Players</Label>
                        <Select
                            value={form.maxPlayers}
                            onValueChange={(value) => setForm(prev => ({ ...prev, maxPlayers: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select max players" />
                            </SelectTrigger>
                            <SelectContent>
                                {[2, 3, 4, 5, 6].map(num => (
                                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isPrivate"
                            checked={form.isPrivate}
                            onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPrivate: Boolean(checked) }))}
                        />
                        <Label htmlFor="isPrivate">Private Room</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gameMode">Game Mode</Label>
                        <Select
                            value={form.gameMode}
                            onValueChange={(value) => setForm(prev => ({ ...prev, gameMode: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SPEED_TEST">Speed Test</SelectItem>
                                <SelectItem value="ACCURACY_TEST">Accuracy Test</SelectItem>
                                <SelectItem value="SURVIVAL">Survival</SelectItem>
                                <SelectItem value="CUSTOM_TEXT">Custom Text</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="textLength">Text Length</Label>
                        <Select
                            value={form.textLength}
                            onValueChange={(value) => setForm(prev => ({ ...prev, textLength: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SHORT">Short</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LONG">Long</SelectItem>
                                <SelectItem value="MARATHON">Marathon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                        <Input
                            name="timeLimit"
                            type="number"
                            min={15}
                            max={300}
                            value={form.timeLimit}
                            onChange={handleChange}
                        />
                    </div>

                    {form.gameMode === 'CUSTOM_TEXT' && (
                        <div className="space-y-2">
                            <Label htmlFor="customText">Custom Text</Label>
                            <Textarea
                                name="customText"
                                rows={4}
                                value={form.customText}
                                onChange={handleChange}
                                placeholder="Enter custom typing text..."
                            />
                        </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Creating...' : 'Create Room'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
