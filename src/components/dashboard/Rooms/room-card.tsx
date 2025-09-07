"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface RoomCardProps {
    room: Room
}

export function RoomCard({ room }: RoomCardProps) {
    const [showAll, setShowAll] = useState(false)

    // Calculate average stats from all typing speeds in this room
    const avgWpm =
        room.typingSpeeds.length > 0
            ? Math.round(room.typingSpeeds.reduce((sum, ts) => sum + ts.wpm, 0) / room.typingSpeeds.length)
            : 0

    const totalCorrectWords = room.typingSpeeds.reduce((sum, ts) => sum + ts.correctword, 0)

    const allIncorrectChars = room.typingSpeeds.flatMap((ts) => ts.incorrectchar)
    const uniqueIncorrectChars = [...new Set(allIncorrectChars)]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "FINISHED":
                return "bg-green-600 text-white"
            case "IN_GAME":
                return "bg-green-500 text-white"
            case "WAITING":
                return "bg-yellow-500 text-black"
            default:
                return "bg-gray-500 text-white"
        }
    }

    return (
        <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-green-400 text-lg font-semibold">{room.name}</CardTitle>
                </div>
                {room.description && <p className="text-gray-400 text-sm">{room.description}</p>}
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <div className="text-green-500 text-2xl font-bold">{avgWpm}</div>
                        <div className="text-gray-400 text-sm">Avg WPM</div>
                    </div>

                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <div className="text-green-500 text-2xl font-bold">{totalCorrectWords}</div>
                        <div className="text-gray-400 text-sm">Correct Words</div>
                    </div>
                </div>

                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-sm mb-2">Incorrect Characters</div>
                    <div className="flex flex-wrap gap-1">
                        {uniqueIncorrectChars.length > 0 ? (
                            <>
                                {(showAll ? uniqueIncorrectChars : uniqueIncorrectChars.slice(0, 10)).map((char, index) => (
                                    <span key={index} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                        {char}
                                    </span>
                                ))}
                                {uniqueIncorrectChars.length > 10 && !showAll && (
                                    <button
                                        className="text-gray-400 text-xs underline cursor-pointer px-2"
                                        onClick={() => setShowAll(true)}
                                        type="button"
                                    >
                                        +{uniqueIncorrectChars.length - 10} more
                                    </button>
                                )}
                                {uniqueIncorrectChars.length > 10 && showAll && (
                                    <button
                                        className="text-gray-400 text-xs underline cursor-pointer px-2"
                                        onClick={() => setShowAll(false)}
                                        type="button"
                                    >
                                        Show less
                                    </button>
                                )}
                            </>
                        ) : (
                            <span className="text-green-500 text-sm">No errors!</span>
                        )}
                    </div>
                </div>

                <div className="text-gray-500 text-xs">Created: {new Date(room.createdAt).toLocaleDateString()}</div>
            </CardContent>
        </Card>
    )
}
