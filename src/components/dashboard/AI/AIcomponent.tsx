"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, AlertCircle, TrendingDown } from "lucide-react";

type RiskyKey = {
    char: string;
    risk: number;
};

export default function RoomDashboard() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [riskyKeys, setRiskyKeys] = useState<RiskyKey[]>([]);

    useEffect(() => {
        if (!session?.user?.email) return;

        const fetchMLData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("🔍 Fetching ML data for:", session.user.email);

                const res = await fetch("/api/ai", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "getAll",
                        email: session.user.email
                    }),
                });

                console.log("📡 Response status:", res.status);

                const result = await res.json();
                console.log("📦 Response data:", result);

                if (!res.ok) {
                    throw new Error(result?.error || `Server error: ${res.status}`);
                }

                if (!result.success && result.error) {
                    throw new Error(result.error);
                }

                // Validate payload: ensure riskyKeys is an array before setting state
                if (!Array.isArray(result.riskyKeys)) {
                    throw new Error("Invalid response: riskyKeys missing or malformed");
                }

                setRiskyKeys(result.riskyKeys as RiskyKey[]);
                console.log("✅ Risky keys loaded:", result.riskyKeys.length || 0);

            } catch (err) {
                console.error("💥 Error fetching ML data:", err);
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchMLData();
    }, [session?.user?.email]);

    // -------- UI STATES --------

    if (status === "loading") {
        return (
            <div className="p-4 flex items-center gap-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking session...</span>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="p-4 flex items-center gap-2 text-yellow-500">
                <AlertCircle className="h-5 w-5" />
                <span>Please log in to view your dashboard.</span>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-4 flex items-center gap-2 text-green-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading your typing insights...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-500 mb-1">Error Loading Data</h3>
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -------- DASHBOARD --------

    return (
        <div className="ml-5 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white mb-2">
                    Typing Performance Dashboard
                </h1>
                <p className="text-gray-400">
                    AI-powered insights to improve your typing
                </p>
            </div>

            {/* ML Insight Card */}
            <div className="bg-gray-900 border border-gray-800 shadow-lg rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-lg font-medium text-white">
                        Keys to Focus On
                    </h2>
                </div>

                {riskyKeys.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-lg">
                            No typing data available. Perform typing sessions to generate insights.
                        </p>
                    </div>
                ) : (
                    // Render keys in a horizontal row (wraps on small screens)
                    <div className="flex flex-row gap-3 flex-wrap">
                        {riskyKeys.map((key) => (
                            <div
                                key={key.char}
                                className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 hover:border-gray-600 transition-colors min-w-[140px]"
                            >
                                {/* Key Display */}
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg">
                                    <span className="text-xl font-mono font-bold text-white">
                                        {key.char.toUpperCase()}
                                    </span>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Predictions are based on your recent typing sessions</span>
            </div>
        </div>
    );
}
