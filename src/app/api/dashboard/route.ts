import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "./handlers/getRoom";
import { AppError, handleError } from "@/lib/error";
import { getAnalysis } from "./handlers/get-analysis";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Add some logging to debug
        switch (body.action) {
            case 'get-room':
                const userData = await getRoom(body);
                return NextResponse.json({
                    success: true,
                    data: userData
                });
            case "get-analysis":
                const analysisResult = await getAnalysis(body)
                return NextResponse.json({ success: true, data: analysisResult })
            default:
                console.log('Invalid action received:', body.action);
                throw new AppError(400, 'Invalid action');
        }
    } catch (error) {
        console.error('Route handler error:', error);
        return handleError(error);
    }
}