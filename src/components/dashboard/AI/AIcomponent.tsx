"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

                const res = await fetch("/api/AI", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "getAll",
                        email: session.user.email,
                    }),
                });

                const raw = await res.text();
                console.log("STATUS:", res.status);
                console.log("RAW RESPONSE:", raw);

                const result = raw ? JSON.parse(raw) : null;

                if (!res.ok) {
                    throw new Error(result?.error || "Failed to load dashboard data");
                }

                setRiskyKeys(result.riskyKeys);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchMLData();
    }, [session?.user?.email]);

    // -------- UI STATES --------

    if (status === "loading") {
        return <p className="p-4" > Checking session...</p>;
    }

    if (!session) {
        return <p className="p-4" > Please log in to view your dashboard.</p>;
    }

    if (loading) {
        return <p className="p-4" > Loading your typing insights…</p>;
    }

    if (error) {
        return <p className="p-4 text-red-500" > {error} </p>;
    }

    // -------- DASHBOARD --------

    return (
        <div className="p-6 space-y-6" >
            <h1 className="text-2xl font-semibold" >
                Typing Performance Dashboard
            </h1>

            {/* ML Insight Card */}
            <div className="bg-white shadow rounded-lg p-4" >
                <h2 className="text-lg font-medium mb-2" >
                    ⚠️ Keys to Focus On
                </h2>

                {
                    riskyKeys.length === 0 ? (
                        <p className="text-gray-500" >
                            No risky keys detected.Great job 👏
                        </p>
                    ) : (
                        <ul className="space-y-2" >
                            {
                                riskyKeys.map((key) => (
                                    <li
                                        key={key.char}
                                        className="flex items-center justify-between border rounded px-3 py-2"
                                    >
                                        <span className="text-lg font-mono" >
                                            {key.char.toUpperCase()}
                                        </span>

                                        < div className="flex items-center gap-2" >
                                            <div className="w-32 bg-gray-200 rounded-full h-2" >
                                                <div
                                                    className="bg-red-500 h-2 rounded-full"
                                                    style={{ width: `${Math.round(key.risk * 100)}%` }}
                                                />
                                            </div>
                                            < span className="text-sm text-gray-600" >
                                                {Math.round(key.risk * 100)} %
                                            </span>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    )
                }
            </div>

            {/* Future sections */}
            <div className="text-sm text-gray-400" >
                Predictions are based on your recent typing sessions.
            </div>
        </div>
    );
}
