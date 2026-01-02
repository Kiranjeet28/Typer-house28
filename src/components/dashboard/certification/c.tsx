"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Award, Zap, Target, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { generatePDF } from "@/lib/dashboard/pdf-generator"

interface CertificationData {
    wpm: number
    accuracy: number
    totalWords: number
    totalTests: number
    level: number
    rank: string
}

export default function CertificationPage() {
    const { data: session } = useSession()
    const [isGenerating, setIsGenerating] = useState(false)
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const certificateRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return

            try {
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
                if (result.success) {
                    setUserData(result.data)
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error)
                setError("Failed to load user data")
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [session?.user?.email])

    const calculateStats = () => {
        if (!userData?.createdRooms) {
            return {
                wpm: 0,
                accuracy: 0,
                totalWords: 0,
                totalTests: 0,
                level: 1,
                rank: "Beginner Typist",
            }
        }

        const allTypingSpeeds = userData.createdRooms.flatMap((room: any) => room.typingSpeeds) || []
        const totalTests = allTypingSpeeds.length
        const avgWpm =
            totalTests > 0 ? Math.round(allTypingSpeeds.reduce((sum: number, ts: any) => sum + ts.wpm, 0) / totalTests) : 0
        const totalWords = allTypingSpeeds.reduce((sum: number, ts: any) => sum + ts.correctword, 0)

        // Calculate accuracy based on correct words vs total characters
        const totalCorrectWords = allTypingSpeeds.reduce((sum: number, ts: any) => sum + ts.correctword, 0)
        const totalIncorrectChars = allTypingSpeeds.reduce(
            (sum: number, ts: any) => sum + (ts.incorrectchar?.length || 0),
            0,
        )
        const accuracy =
            totalCorrectWords > 0 ? Math.round((totalCorrectWords / (totalCorrectWords + totalIncorrectChars)) * 100) : 0

        // Determine level and rank based on WPM
        const level = Math.floor(avgWpm / 10) + 1
        let rank = "Beginner Typist"

        if (avgWpm >= 80) rank = "Expert Typist"
        else if (avgWpm >= 60) rank = "Advanced Typist"
        else if (avgWpm >= 40) rank = "Intermediate Typist"
        else if (avgWpm >= 20) rank = "Novice Typist"

        return {
            wpm: avgWpm,
            accuracy: Math.min(accuracy, 100),
            totalWords,
            totalTests,
            level: Math.min(level, 10),
            rank,
        }
    }

    const certData = calculateStats()

    const handleGeneratePDF = async () => {
        if (!session?.user || !certificateRef.current) {
            setError("Certificate element not found")
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            // Wait a bit to ensure the certificate is fully rendered
            await new Promise(resolve => setTimeout(resolve, 500))

            await generatePDF(certificateRef.current, {
                filename: `${session.user.name?.replace(/\s+/g, "_")}_Typing_Certificate.pdf`,
                userName: session.user.name || "User",
                userEmail: session.user.email || "",
                ...certData,
            })

            // Show success message
            setError("PDF downloaded successfully!")
            setTimeout(() => setError(null), 3000)
        } catch (error) {
            console.error("Failed to generate PDF:", error)
            setError(error instanceof Error ? error.message : "Failed to generate PDF certificate")
        } finally {
            setIsGenerating(false)
        }
    }

    const getRankColor = (rank: string) => {
        switch (rank) {
            case "Expert Typist":
                return "bg-green-500"
            case "Advanced Typist":
                return "bg-blue-500"
            case "Intermediate Typist":
                return "bg-yellow-500"
            case "Novice Typist":
                return "bg-orange-500"
            default:
                return "bg-gray-500"
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <Card className="w-full max-w-md bg-gray-900 border-gray-800">
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-400">Please sign in to access certification</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                    <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                    <span>Loading your typing data...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen mt-8  p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-left space-y-2">
                    <h1 className="text-3xl font-bold text-white">Typing Certification</h1>
                    <p className="text-gray-400">Generate your official typing proficiency certificate</p>
                </div>

                {/* Error Display */}
                {error && (
                    <Card className={`border ${error.includes('successfully') ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className={`h-5 w-5 ${error.includes('successfully') ? 'text-green-500' : 'text-red-500'}`} />
                                <p className={`${error.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                                    {error}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4 text-center">
                            <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{certData.wpm}</p>
                            <p className="text-sm text-gray-400">WPM</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4 text-center">
                            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{certData.accuracy}%</p>
                            <p className="text-sm text-gray-400">Accuracy</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">Level {certData.level}</p>
                            <p className="text-sm text-gray-400">Current Level</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4 text-center">
                            <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{certData.totalTests}</p>
                            <p className="text-sm text-gray-400">Tests Completed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Certificate Preview */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-500" />
                            Certificate Preview
                        </CardTitle>
                        <CardDescription>Preview of your typing proficiency certificate</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            ref={certificateRef}
                            className="bg-white p-8 rounded-lg shadow-lg text-black min-h-[600px] relative overflow-hidden"
                        >
                            {/* Certificate Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-4 left-4 w-32 h-32 border-2 border-green-500 rounded-full"></div>
                                <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-green-500 rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-green-300 rounded-full"></div>
                            </div>

                            {/* Certificate Content */}
                            <div className="relative z-10 text-center space-y-6">
                                {/* Logo and Header */}
                                <div className="space-y-4">
                                    <div className="mx-auto flex items-center justify-center ">
                                        <img
                                            src="/logo/Logo.png"
                                            alt="Typer House Logo"
                                            className="w-12 h-12 object-contain rounded-full"
                                        />
                                    </div>
                                    <h1 className="text-4xl font-bold text-gray-800">Typer House</h1>
                                    <h2 className="text-2xl font-semibold text-green-600">Certificate of Typing Proficiency</h2>
                                </div>

                                {/* Recipient */}
                                <div className="space-y-2">
                                    <p className="text-lg text-gray-600">This is to certify that</p>
                                    <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-green-500 pb-2 inline-block">
                                        {session.user.name}
                                    </h3>
                                    <p className="text-gray-600">has successfully demonstrated typing proficiency</p>
                                </div>

                                {/* Achievement Details */}
                                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-green-600">{certData.wpm}</p>
                                            <p className="text-sm text-gray-600">Words Per Minute</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-green-600">{certData.accuracy}%</p>
                                            <p className="text-sm text-gray-600">Accuracy Rate</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className={`${getRankColor(certData.rank)} text-white px-4 py-2 text-lg rounded`}>
                                            {certData.rank}
                                        </div>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <p className="text-sm text-gray-600">Total Words Typed: {certData.totalWords.toLocaleString()}</p>
                                        <p className="text-sm text-gray-600">Tests Completed: {certData.totalTests}</p>
                                        <p className="text-sm text-gray-600">Current Level: {certData.level}</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="space-y-4 pt-8">
                                    <div className="flex justify-between items-end">
                                        <div className="text-left">
                                            <div className="border-t-2 border-gray-400 w-32 mb-2"></div>
                                            <p className="text-sm text-gray-600">Authorized Signature</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="border-t-2 border-gray-400 w-32 mb-2 ml-auto"></div>
                                            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Certificate ID: TH-{Date.now().toString().slice(-8)}</p>
                                        <p className="text-xs text-gray-500">
                                            Issued by Typer House - Official Typing Certification Authority
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Generate PDF Button */}
                <div className="text-center">
                    <Button
                        onClick={handleGeneratePDF}
                        disabled={isGenerating}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5 mr-2" />
                                Download Certificate PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}