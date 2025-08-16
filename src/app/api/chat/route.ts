import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store in .env.local
});
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 200, // small, since we only need 3 tips
    });

    return NextResponse.json({
      reply: completion.choices[0].message,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
