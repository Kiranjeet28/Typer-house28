"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface LevelProgressProps {
    averageWpm: number
    averageAccuracy: number
    totalSessions: number
}

export function LevelProgress({ averageWpm, averageAccuracy, totalSessions }: LevelProgressProps) {
    // Calculate level based on WPM and accuracy
    const calculateLevel = (wpm: number, accuracy: number) => {
        const baseLevel = Math.floor(wpm / 10)
        const accuracyBonus = accuracy > 90 ? 2 : accuracy > 80 ? 1 : 0
        return Math.max(1, baseLevel + accuracyBonus)
    }

    const currentLevel = calculateLevel(averageWpm, averageAccuracy)
    const nextLevelWpm = (currentLevel + 1) * 10
    const progressToNextLevel = ((averageWpm % 10) / 10) * 100

    const getLevelTitle = (level: number) => {
        if (level >= 10) return "Master Typist"
        if (level >= 8) return "Expert Typist"
        if (level >= 6) return "Advanced Typist"
        if (level >= 4) return "Intermediate Typist"
        if (level >= 2) return "Beginner Typist"
        return "Novice Typist"
    }

    return (
        <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-green-400">Typing Level Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-green-500 mb-2">Level {currentLevel}</div>
                    <div className="text-lg text-green-400 mb-4">{getLevelTitle(currentLevel)}</div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Progress to Level {currentLevel + 1}</span>
                            <span>{Math.round(progressToNextLevel)}%</span>
                        </div>
                        <Progress value={progressToNextLevel} className="h-3 bg-gray-700" />
                        <div className="text-xs text-gray-500 mt-1">Need {nextLevelWpm} WPM for next level</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{averageWpm}</div>
                            <div className="text-sm text-gray-400">Avg WPM</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{Math.round(averageAccuracy)}%</div>
                            <div className="text-sm text-gray-400">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{totalSessions}</div>
                            <div className="text-sm text-gray-400">Sessions</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
