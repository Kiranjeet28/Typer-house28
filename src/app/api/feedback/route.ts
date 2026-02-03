import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const data = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } })
        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e?.message || "Failed to fetch" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const rating = Number(body.rating || 0)
        const review = (body.review || "").toString()
        const name = (body.name || null)?.toString()

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, error: "Rating must be 1-5" }, { status: 400 })
        }

        const entry = await prisma.feedback.create({
            data: {
                name: name || undefined,
                rating,
                review: review || undefined,
            },
        })

        return NextResponse.json({ success: true, data: entry })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e?.message || "Failed" }, { status: 500 })
    }
}
