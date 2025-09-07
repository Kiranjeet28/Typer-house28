"use client"

import { User, Calendar, Trophy, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface UserProfileCardProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        username?: string | null
        createdAt?: string
    }
    stats: {
        totalRooms: number
        totalGames: number
        avgWpm: number
        bestWpm: number
    }
}

export function UserProfileCard({ user, stats }: UserProfileCardProps) {
    // Get user initials from name or email
    const getInitials = (name?: string | null, email?: string | null) => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
        }
        if (email) {
            return email[0].toUpperCase()
        }
        return "U"
    }

    const initials = getInitials(user.name, user.email)
    const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"

    return (
        <Card className="bg-gray-900 border-gray-800 mb-8 hover:border-green-500/50 transition-colors">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Profile Image/Avatar */}
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        {user.image ? (
                            <img
                                src={user.image || "/placeholder.svg"}
                                alt={user.name || "User"}
                                className="w-24 h-24 rounded-full border-3 border-green-500 object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-3 border-green-500 bg-green-300 flex items-center justify-center shadow-lg">
                                <span className="text-3xl font-bold text-gray-900">{initials}</span>
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                            <h2 className="text-3xl font-bold text-white">{user.name || "Anonymous User"}</h2>
                            {user.username && <span className="text-green-400 text-lg font-medium">@{user.username}</span>}
                        </div>

                        <p className="text-gray-400 mb-4 text-lg">{user.email}</p>

                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mb-6">
                            <Calendar className="h-4 w-4" />
                            <span>Member since {joinDate}</span>
                        </div>

                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-400">{stats.totalRooms}</div>
                                <div className="text-xs text-gray-400 font-medium">Rooms Created</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <User className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-400">{stats.totalGames}</div>
                                <div className="text-xs text-gray-400 font-medium">Games Played</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <Trophy className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-400">{stats.avgWpm}</div>
                                <div className="text-xs text-gray-400 font-medium">Avg WPM</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-600">{stats.bestWpm}</div>
                                <div className="text-xs text-gray-400 font-medium">Best WPM</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
