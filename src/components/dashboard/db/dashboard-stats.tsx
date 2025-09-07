"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStatsProps {
    totalRooms: number
    totalGames: number
    avgWpm: number
    bestWpm: number
}

export function DashboardStats({ totalRooms, totalGames, avgWpm, bestWpm }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 text-sm font-medium">Total Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{totalRooms}</div>
                </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 text-sm font-medium">Total Games</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{totalGames}</div>
                </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 text-sm font-medium">Average WPM</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{avgWpm}</div>
                </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 text-sm font-medium">Best WPM</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{bestWpm}</div>
                </CardContent>
            </Card>
        </div>
    )
}
