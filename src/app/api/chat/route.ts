import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing 'prompt' in request body" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceTB/SmolLM2-1.7B-Instruct",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HuggingFace API error:", errorText); // <-- log actual error
      return NextResponse.json(
        { success: false, error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("HuggingFace API response:", data);

    return NextResponse.json({
      success: true,
      output: data[0]?.summary_text || data,
    });
  } catch (error: any) {
    console.error("Route Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
