"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface WpmChartProps {
    data: Array<{
        date: string
        wpm: number
        roomName: string
    }>
}

export function WpmChart({ data }: WpmChartProps) {
    const chartConfig = {
        wpm: {
            label: "WPM",
            color: "rgb(34, 197, 94)", // green-500
        },
    }

    return (
        <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-green-400">WPM Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                    color: "#F3F4F6",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="wpm"
                                stroke="rgb(34, 197, 94)"
                                strokeWidth={2}
                                dot={{ fill: "rgb(34, 197, 94)", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: "rgb(16, 185, 129)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
