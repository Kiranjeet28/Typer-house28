"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AccuracyChartProps {
    data: Array<{
        date: string
        accuracy: number
        correctword: number
        incorrectchar: string[]
        roomName: string
    }>
}

export function AccuracyChart({ data }: AccuracyChartProps) {
    const chartConfig = {
        accuracy: {
            label: "Accuracy %",
            color: "rgb(16, 185, 129)", // green-600
        },
    }

    return (
        <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-green-400">Accuracy Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                    color: "#F3F4F6",
                                }}
                            />
                            <Bar dataKey="accuracy" fill="rgb(16, 185, 129)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
