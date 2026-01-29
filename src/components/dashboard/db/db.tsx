"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { RoomCard } from "../Rooms/room-card"
import { DashboardStats } from "./dashboard-stats"
import { UserProfileCard } from "./user-profile-card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, LogOut, BarChart3 } from "lucide-react"
import Link from "next/link"

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

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Redirect to sign in if not authenticated
    useEffect(() => {
        if (status === "loading") return // Still loading
        if (!session) {
            router.push("/auth/signin")
            return
        }
    }, [session, status, router])

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
                    action: "get-room",
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

    // Show loading while checking authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        <span className="ml-2 text-gray-400">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    // Don't render if not authenticated (will redirect)
    if (!session) {
        return null
    }

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
            <div className="min-h-screen bg-gray-950 text-white">
                <div className="">
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
            <div className="min-h-screen bg-gray-950 text-white">
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
        <div className="h-[90vh] mt-5 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400 mb-2">Typing Dashboard</h1>
                        <p className="text-gray-400">Welcome back, {session?.user?.name || "User"}!</p>
                    </div>
                    <div className="flex items-center gap-2">

                        <Button
                            onClick={fetchRooms}
                            variant="outline"
                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white bg-transparent"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        {!pathname.endsWith("/room") &&
                            (
                                <Button
                                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            )}

                    </div>
                </div>

                {session?.user && (
                    <UserProfileCard
                        user={{
                            name: session.user.name,
                            email: session.user.email,
                            image: session.user.image,
                            username: undefined,
                            createdAt: new Date().toISOString(), // Fallback
                        }}
                        stats={{
                            totalRooms,
                            totalGames,
                            avgWpm,
                            bestWpm,
                        }}
                    />
                )}

                <DashboardStats
                    totalRooms={totalRooms}
                    totalGames={totalGames}
                    avgWpm={avgWpm}
                    bestWpm={bestWpm}
                />



            </div>
        </div>
    )
}