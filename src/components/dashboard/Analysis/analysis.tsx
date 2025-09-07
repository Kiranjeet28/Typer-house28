"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { WpmChart } from "./wpm-chart"
import { AccuracyChart } from "./accuracy-chart"
import { LevelProgress } from "./level-progress"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TypingSpeedData {
    id: string
    wpm: number
    correctword: number
    incorrectchar: string[]
    createdAt: string
    roomName: string
    date: string
    accuracy: number
}

interface AnalysisData {
    typingSpeeds: TypingSpeedData[]
    totalSessions: number
    averageWpm: number
    bestWpm: number
    averageAccuracy: number
}

export default function Analysis() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
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
            <div className="min-h-screen bg-gray-950 text-white">
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
        <div className="min-h-screen mt-5 bg-gray-950 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      
                        <div>
                            <h1 className="text-3xl font-bold text-green-400 mb-2">Typing Analysis</h1>
                            <p className="text-gray-400">Track your progress and improve your skills</p>
                        </div>
                    </div>
                    <Button
                        onClick={fetchAnalysis}
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white bg-transparent"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {!analysisData?.typingSpeeds.length ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">No typing data found</div>
                        <p className="text-gray-500">Complete some typing sessions to see your analysis!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Level Progress */}
                        <LevelProgress
                            averageWpm={analysisData.averageWpm}
                            averageAccuracy={analysisData.averageAccuracy}
                            totalSessions={analysisData.totalSessions}
                        />

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WpmChart data={analysisData.typingSpeeds} />
                            <AccuracyChart data={analysisData.typingSpeeds} />
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-500">{analysisData.totalSessions}</div>
                                <div className="text-sm text-gray-400">Total Sessions</div>
                            </div>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-500">{analysisData.averageWpm}</div>
                                <div className="text-sm text-gray-400">Average WPM</div>
                            </div>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{analysisData.bestWpm}</div>
                                <div className="text-sm text-gray-400">Best WPM</div>
                            </div>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-500">{Math.round(analysisData.averageAccuracy)}%</div>
                                <div className="text-sm text-gray-400">Average Accuracy</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
