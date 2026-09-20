import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await encode({
        token: { uid: userId },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 60,
    });

    return NextResponse.json({ token });
}
