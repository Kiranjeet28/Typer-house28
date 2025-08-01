"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SpeedData {
  name: string;
  wpm: number;
}

export default function ResultPage({ params }: PageProps) {
  const [data, setData] = useState<SpeedData[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    params.then((resolvedParams) => {
      setRoomId(resolvedParams.id);

      fetch(`/api/room?id=${resolvedParams.id}&action=speed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((d) => {
          const speedData = Array.isArray(d) ? d : [];
          const transformed = speedData.map((user: any) => ({
            name: user.name || "Unknown",
            wpm: user.wpm || 0,
          }));
          setData(transformed);
        })
        .catch((error) => {
          setError(`Failed to load speed data: ${error.message}`);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [params]);

  // Helper function to display player name
  const getDisplayName = (playerName: string) => {
    if (session?.user?.name && playerName === session.user.name) {
      return "You";
    }
    return playerName;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto bg-[#18181b] min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-300 animate-pulse">Loading speed results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto bg-[#18181b] min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-center bg-[#27272a] p-6 rounded-xl shadow-lg border border-red-900/40">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div>
        <div className="p-6 max-w-3xl mx-auto bg-[#18181b] min-h-screen flex items-center justify-center"></div>
        <div className="text-center text-gray-400 bg-[#27272a] p-6 rounded-xl shadow-lg">
          Invalid room ID
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 my-4 sm:my-10 mx-1 sm:mx-20 bg-[#18181b] min-h-screen">
      {data.length === 0 ? (
        <div className="text-center text-gray-500 bg-[#23232b] p-4 sm:p-8 rounded-xl shadow-inner border border-[#27272a]">
          <p>No speed data available for this room yet.</p>
        </div>
      ) : (
          <>
            <div>
          <div className="mb-4 text-center"></div>
            <p className="text-base text-gray-400">
              Showing results for <span className="font-semibold text-green-500 ">{data.length}</span> participant{data.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#23232b] to-[#18181b] p-2 sm:p-6 rounded-2xl shadow-2xl border border-[#27272a] mb-4 sm:mb-8">
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 220 : 400}>
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: window.innerWidth < 640 ? 10 : 30,
                  left: window.innerWidth < 640 ? 0 : 20,
                  bottom: window.innerWidth < 640 ? 40 : 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  angle={window.innerWidth < 640 ? -30 : -45}
                  textAnchor="end"
                  height={window.innerWidth < 640 ? 50 : 80}
                  interval={0}
                  tick={{ fill: "#f3f4f6", fontWeight: 600, fontSize: window.innerWidth < 640 ? 11 : 14 }}
                  axisLine={{ stroke: "#52525b" }}
                  tickLine={{ stroke: "#52525b" }}
                  tickFormatter={(value) => getDisplayName(value)}
                />
                <YAxis
                  domain={[0, 'dataMax + 20']}
                  label={
                    window.innerWidth < 640
                      ? undefined
                      : {
                          value: 'Words Per Minute (WPM)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: "#f3f4f6",
                          fontWeight: 700,
                          fontSize: 14,
                        }
                  }
                  tick={{ fill: "#f3f4f6", fontWeight: 600, fontSize: window.innerWidth < 640 ? 11 : 14 }}
                  axisLine={{ stroke: "#52525b" }}
                  tickLine={{ stroke: "#52525b" }}
                />
                <Tooltip
                  formatter={(value, name) => [`${value} WPM`, 'Speed']}
                  labelFormatter={(label) => `Player: ${getDisplayName(label)}`}
                  contentStyle={{
                    backgroundColor: '#23232b',
                    border: '1px solid #52525b',
                    borderRadius: '8px',
                    color: '#fbbf24',
                  }}
                  itemStyle={{ color: '#fbbf24', fontWeight: 600 }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 700 }}
                  cursor={{ fill: '#27272a', opacity: 0.5 }}
                />
                <Legend
                  wrapperStyle={{
                    color: "#fbbf24",
                    fontWeight: 700,
                  }}
                  iconType="circle"
                />
                <Bar
                  dataKey="wpm"
                  name="Speed (WPM)"
                  radius={[8, 8, 0, 0]}
                >
                  {data.map((entry, index) => {
                    const sortedData = [...data].sort((a, b) => b.wpm - a.wpm);
                    const rank = sortedData.findIndex(item => item.name === entry.name);
                    let color = '#38bdf8'; // Default blue

                    if (rank === 0) color = '#fbbf24'; // Gold for 1st
                    else if (rank === 1) color = '#a1a1aa'; // Silver for 2nd
                    else if (rank === 2) color = '#f59e0b'; // Bronze for 3rd

                    // Highlight current user's bar with a special color
                    if (session?.user?.name && entry.name === session.user.name) {
                      color = '#10b981'; // Green for current user
                    }

                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Results Summary with Medal Icons */}
          <div className="mt-4 sm:mt-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-5 text-[#fbbf24] flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🏆</span> Leaderboard
            </h3>
            <div className="grid gap-2 sm:gap-4">
              {[...data]
                .sort((a, b) => b.wpm - a.wpm)
                .map((player, index) => {
                  let medal = '';
                  let bgColor = 'bg-[#23232b]';
                  let border = 'border border-[#27272a]';
                  let textColor = 'text-gray-100';
                  const isCurrentUser = session?.user?.name && player.name === session.user.name;

                  if (index === 0) {
                    medal = '🥇';
                    bgColor = 'bg-gradient-to-r from-[#fbbf24]/30 to-[#fde68a]/10';
                    border = 'border-2 border-[#fbbf24]/60';
                    textColor = 'text-[#fbbf24]';
                  } else if (index === 1) {
                    medal = '🥈';
                    bgColor = 'bg-gradient-to-r from-[#a1a1aa]/30 to-[#e5e7eb]/10';
                    border = 'border-2 border-[#a1a1aa]/60';
                    textColor = 'text-[#a1a1aa]';
                  } else if (index === 2) {
                    medal = '🥉';
                    bgColor = 'bg-gradient-to-r from-[#f59e0b]/30 to-[#fbbf24]/10';
                    border = 'border-2 border-[#f59e0b]/60';
                    textColor = 'text-[#f59e0b]';
                  }

                  // Special styling for current user
                  if (isCurrentUser) {
                    bgColor = `${bgColor} ring-2 ring-green-500/50`;
                    border = `${border} ring-green-500/30`;
                  }

                  return (
                    <div
                      key={player.name}
                      className={`flex flex-col sm:flex-row justify-between items-center p-3 sm:p-5 rounded-xl shadow-lg ${bgColor} ${border} ${textColor} transition-all hover:scale-[1.02] hover:shadow-2xl ${isCurrentUser ? 'ring-2 ring-green-500/30' : ''}`}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                        <span className="text-2xl sm:text-3xl">{medal}</span>
                        <div>
                          <span className="font-bold text-lg sm:text-xl">#{index + 1}</span>
                          <span className={`font-medium ml-2 sm:ml-3 text-base sm:text-lg ${isCurrentUser ? 'text-green-400 font-bold' : ''}`}>
                            {getDisplayName(player.name)}
                            {isCurrentUser && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">YOU</span>}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-extrabold text-green-500 drop-shadow-lg">
                          {player.wpm}
                        </span>
                        <span className="text-sm sm:text-base text-green-500 ml-1 sm:ml-2 ">WPM</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
      </div>
  );
}