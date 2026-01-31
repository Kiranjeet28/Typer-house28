"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShineBorder } from "../magicui/shine-border";
import { BottomGradient } from "./joinRoom";
export default function CreateRoomForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        maxPlayers: 4,
        isPrivate: false,
        textLength: "MEDIUM",
        timeLimit: 60,
        customText: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (loading) return;

        const { name, value, type } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : name === "maxPlayers" || name === "timeLimit"
                        ? Number(value)
                        : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        try {
            const res = await fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create", ...form }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to create room");
            }

            if (!data?.roomId) {
                throw new Error("Room ID missing in response");
            }

            toast.success("Room created successfully!");
            router.push(`/room/${data.roomId}/waiting`);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
            setLoading(false); // 🔓 re-enable fields on error
        }
    };

    return (
        <Card className="relative overflow-hidden m-2 md:m-1 md:max-w-[60vw] w-full">
            <ShineBorder shineColor={["#22D3EE", "#22C55E", "#2563EB"]} />

            <CardHeader>
                <CardTitle className="text-2xl text-center text-green-300">
                    Create a Room
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ShineBorder shineColor={["#22D3EE", "#22C55E", "#2563EB"]} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Room Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Room Name</Label>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-row justify-around space-x-4 items-center">
                        {/* Max Players */}
                        <div className="flex gap-2 items-center space-y-2">
                            <Label htmlFor="maxPlayers">Max Players</Label>
                            <Select
                                disabled={loading}
                                value={form.maxPlayers.toString()}
                                onValueChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        maxPlayers: Number(value),
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select max players" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2, 3, 4, 5, 6].map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                            {num}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Text Type */}
                        <div className="flex gap-2 items-center space-y-2">
                            <Label htmlFor="textType">Text Type</Label>
                            <Select
                                disabled={loading}
                                value={form.textLength}
                                onValueChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        textLength: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Text Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SHORT">SIMPLE</SelectItem>
                                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                                    <SelectItem value="LONG">HARD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Time Limit */}
                        <div className="flex gap-2 items-center space-y-2">
                            <Label htmlFor="timeLimit">Time Limit</Label>
                            <Select
                                disabled={loading}
                                value={form.timeLimit.toString()}
                                onValueChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        timeLimit: Number(value),
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time limit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="60">1 minute</SelectItem>
                                    <SelectItem value="180">3 minutes</SelectItem>
                                    <SelectItem value="300">5 minutes</SelectItem>
                                    <SelectItem value="600">10 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`group/btn relative block h-10 w-full rounded-md font-medium text-white
              bg-black shadow
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
            `}
                    >
                        {loading ? "Creating..." : "Create Room"}
                        <BottomGradient />
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
