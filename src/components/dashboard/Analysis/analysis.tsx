"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { WpmChart } from "./wpm-chart"
import { AccuracyChart } from "./accuracy-chart"
import { LevelProgress } from "./level-progress"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, TrendingUp, Target, Award, Clock } from "lucide-react"

interface TypingSpeedData {
    id: string
    wpm: number
    correctword: number
    incorrectchar: string[]
    createdAt: string
    roomName: string
    date: string
}

interface AnalysisData {
    user: {
        id: string
        email: string | null
        name: string | null
    }
    typingSpeeds: TypingSpeedData[]
    totalSessions: number
    averageWpm: number
    bestWpm: number
}

export default function Analysis() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status === "loading") return
        if (!session) {
            router.push("/auth/signin")
            return
        }
    }, [session, status, router])

    const fetchAnalysis = async () => {
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
                    action: "get-analysis",
                    email: session.user.email,
                }),
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || "Failed to fetch analysis data")
            }

            setAnalysisData(result.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.email) {
            fetchAnalysis()
        }
    }, [session?.user?.email])

    // Calculate average accuracy from typing speeds
    const calculateAverageAccuracy = () => {
        if (!analysisData?.typingSpeeds.length) return 0

        const totalAccuracy = analysisData.typingSpeeds.reduce((sum, ts) => {
            // Calculate accuracy: correct words / (correct words + incorrect chars count) * 100
            const totalChars = ts.correctword + (ts.incorrectchar?.length || 0)
            const accuracy = totalChars > 0 ? (ts.correctword / totalChars) * 100 : 0
            return sum + accuracy
        }, 0)

        return Math.round(totalAccuracy / analysisData.typingSpeeds.length)
    }

    const averageAccuracy = calculateAverageAccuracy()

    if (status === "loading") {
        return (
            <div className="min-h-screen text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        <span className="ml-2 text-gray-400">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    if (loading) {
        return (
            <div className="min-h-screen text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        <span className="ml-2 text-gray-400">Loading analysis...</span>
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
                            onClick={fetchAnalysis}
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
        <div className="h-[100vh]">
            <div className="container mx-auto px-4 lg:px-12 xl:px-16 py-6 lg:py-10 max-w-[1600px]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 lg:mb-12">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                            Typing Analysis
                        </h1>
                        <p className="text-gray-400 text-sm lg:text-base">Track your progress and master your typing skills</p>
                    </div>
                    <Button
                        onClick={fetchAnalysis}
                        variant="outline"
                        size="lg"
                        className="border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white bg-gray-900/50 backdrop-blur-sm transition-all duration-200 hover:border-green-400"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh Data
                    </Button>
                </div>

                {!analysisData?.typingSpeeds.length ? (
                    <div className="text-center py-20 bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl">
                        <div className="text-gray-400 text-lg mb-4">No typing data found</div>
                        <p className="text-gray-500">Complete some typing sessions to see your analysis!</p>
                    </div>
                ) : (
                    <div className="space-y-6 lg:space-y-8">
                        {/* Stats Grid - Responsive for all screens */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl p-4 lg:p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-green-400" />
                                </div>
                                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-green-500 mb-1">
                                    {analysisData.totalSessions}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-400">Total Sessions</div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl p-4 lg:p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400" />
                                </div>
                                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-500 mb-1">
                                    {analysisData.averageWpm}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-400">Average WPM</div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl p-4 lg:p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <Award className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-400" />
                                </div>
                                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-emerald-500 mb-1">
                                    {analysisData.bestWpm}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-400">Best WPM</div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl p-4 lg:p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <Target className="h-5 w-5 lg:h-6 lg:w-6 text-purple-400" />
                                </div>
                                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-purple-500 mb-1">
                                    {averageAccuracy}%
                                </div>
                                <div className="text-xs lg:text-sm text-gray-400">Avg Accuracy</div>
                            </div>
                        </div>

                        {/* Level Progress - Full Width on Medium+ */}
                        <div className="w-full">
                            <LevelProgress
                                averageWpm={analysisData.averageWpm}
                                averageAccuracy={averageAccuracy}
                                totalSessions={analysisData.totalSessions}
                            />
                        </div>


                    </div>
                )}
            </div>
        </div>
    )
}