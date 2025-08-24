"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShineBorder } from '../magicui/shine-border';
import { BottomGradient } from './joinRoom';

export default function CreateRoomForm() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        description: '',
        maxPlayers: 4,
        isPrivate: false,
        textLength: 'MEDIUM',
        timeLimit: 60,
        customText: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : name === 'maxPlayers' || name === 'timeLimit'
                    ? Number(value)
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
            const roomId = data?.roomId;
            if (!roomId) {
                throw new Error('Room ID missing in response');
            }
            console.log(data);
            toast.success('Room created successfully!');
            router.push(`/room/${roomId}/waiting`);
            
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
            setLoading(false);
        } 
    };
    
    

    return (
       <Card className="relative overflow-hidden m-2 md:m-1 md:max-w-[60vw] w-full">
                  <ShineBorder shineColor={["#22D3EE", "#22C55E", "#2563EB"]} />
            <CardHeader>
                <CardTitle className="text-2xl text-center text-green-300">Create a Room</CardTitle>
            </CardHeader>
            <CardContent>
                <ShineBorder shineColor={["#22D3EE", "#22C55E", "#2563EB"]} />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" >Room Name</Label>
                        <Input name="name"  value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input name="description" value={form.description} onChange={handleChange} />
                    </div>
                    <div className="flex flex-row justify-around space-x-4 items-center">
                        <div className="flex gap-2 items-center space-y-2">
                            <Label htmlFor="maxPlayers">Max Players</Label>
                            <Select
                                value={form.maxPlayers.toString()}
                                onValueChange={(value) => setForm(prev => ({ ...prev, maxPlayers: Number(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue 
                                        className="border-1 border-green-300"

                                        placeholder="Select max players" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2, 3, 4, 5, 6].map(num => (
                                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                                            {/* <div className="space-y-2">
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
                        </div>*/}
                        {/* <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPrivate"
                                checked={form.isPrivate}
                                onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPrivate: Boolean(checked) }))}
                            />
                            <Label htmlFor="isPrivate">Private Room</Label>
                        </div> */}
                   
                   
                    <div className="flex gap-2 items-center space-y-2">
                        <Label htmlFor="timeLimit">Time Limit</Label>
                        <Select
                            value={form.timeLimit.toString()}
                            onValueChange={(value) => setForm(prev => ({ ...prev, timeLimit: Number(value) }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select time limit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="60">1 minutes</SelectItem>
                                <SelectItem value="180">3 minutes</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                                <SelectItem value="600">10 minutes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    </div>

                   
                   
                    <button
                        type="submit" disabled={loading}
                        className="group/btn relative block h-10 w-full rounded-md font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]  bg-black dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    >
                        {loading ? 'Creating...' : 'Create Room'}
                        <BottomGradient />
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
