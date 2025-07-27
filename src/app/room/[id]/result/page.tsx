// Option 1: Client component with async params handling
"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const [data, setData] = useState([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Resolve the params promise first
    params.then((resolvedParams) => {
      setRoomId(resolvedParams.id);
      
      // Then fetch the data
      fetch(`/api/room/${resolvedParams.id}/speed`)
        .then((res) => res.json())
        .then((d) => {
          const transformed = d.map((user: any) => ({
            name: user.name,
            wpm: user.wpm,
          }));
          setData(transformed);
        })
        .catch((error) => {
          console.error("Error fetching speed data:", error);
        });
    });
  }, [params]);

  if (!roomId) {
    return <div className="p-6 max-w-3xl mx-auto">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Speed Results</h2>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 'dataMax + 20']} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="wpm" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
}

// Option 2: Server component (remove "use client" and make async)
/*
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import ClientChart from "./ClientChart"; // You'd need to create this component

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch data server-side
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/room/${id}/speed`);
  const data = await response.json();
  
  const transformedData = data.map((user: any) => ({
    name: user.name,
    wpm: user.wpm,
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Speed Results</h2>
      <ClientChart data={transformedData} />
    </div>
  );
}
*/