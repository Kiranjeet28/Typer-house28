"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { RoomCard } from "./room-card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"

interface TypingSpeed {
    id: string
    wpm: number
    correctword: number
    incorrectchar: string[]
    createdAt: string
}

interface Room {
    id: string
    name: string
    description?: string
    status: string
    createdAt: string
    typingSpeeds: TypingSpeed[]
}

export default function Room() {
    const { data: session } = useSession()
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRooms = async () => {
        if (!session?.user?.email) {
            setError("No user email found")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch("/api/dashboard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: 'get-all-games',
                    email: session.user.email,
                }),
            })
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || "Failed to fetch rooms")
            }

            // The API returns an array of rooms directly
            setRooms(Array.isArray(result.data) ? result.data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.email) {
            fetchRooms()
        }
    }, [session?.user?.email])

    // Calculate stats from rooms array
    const totalRooms = rooms.length
    const allTypingSpeeds = rooms.flatMap((room) => room.typingSpeeds || [])
    const totalGames = allTypingSpeeds.length
    const avgWpm = totalGames > 0
        ? Math.round(allTypingSpeeds.reduce((sum, ts) => sum + ts.wpm, 0) / totalGames)
        : 0
    const bestWpm = totalGames > 0
        ? Math.max(...allTypingSpeeds.map((ts) => ts.wpm))
        : 0

    if (loading) {
        return (
            <div className="min-h-screen text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        <span className="ml-2 text-gray-400">Loading your rooms...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">Error: {error}</div>
                        <Button
                            onClick={fetchRooms}
                            variant="outline"
                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white bg-transparent"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen ml-5 mt-5 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400 mb-2">Rooms</h1>
                        <p className="text-gray-400">Welcome back, {session?.user?.name || "User"}! Here are all your Rooms</p>
                    </div>
                    <Button
                        onClick={fetchRooms}
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white bg-transparent"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-green-400 mb-4">Your Rooms ({totalRooms})</h2>
                </div>

                {rooms.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">No rooms found</div>
                        <p className="text-gray-500">Create your first typing room to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <RoomCard key={room.id} room={room} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}