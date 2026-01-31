import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "./handlers/getRoom";
import { AppError, handleError } from "@/lib/error";
import { getAnalysis } from "./handlers/get-analysis";

export async function POST(request: NextRequest) {
    try {
        console.log("📥 ============================================");
        console.log("📥 DASHBOARD API - New Request Received");
        console.log("📥 ============================================");

        const body = await request.json();
        console.log("📦 Request body:", JSON.stringify(body, null, 2));

        // Validate that action exists
        if (!body.action) {
            console.error('❌ Missing action in request body');
            throw new AppError(400, 'Missing action parameter');
        }

        console.log('✅ Processing action:', body.action);

        switch (body.action) {
            case 'get-room': {
                console.log("🏠 Handling get-room action");

                const userData = await getRoom(body);

                console.log("✅ get-room completed successfully");
                console.log("📊 Data summary:", {
                    roomCount: Array.isArray(userData) ? userData.length : 0,
                    dataType: Array.isArray(userData) ? 'array' : typeof userData,
                });

                return NextResponse.json({
                    success: true,
                    data: userData
                });
            }

            case "get-analysis": {
                console.log("📊 Handling get-analysis action");

                const analysisResult = await getAnalysis(body);

                console.log("✅ get-analysis completed successfully");

                return NextResponse.json({
                    success: true,
                    data: analysisResult
                });
            }

            default:
                console.error('❌ Invalid action received:', body.action);
                throw new AppError(400, `Invalid action: ${body.action}`);
        }

    } catch (error) {
        console.error('💥 ============================================');
        console.error('💥 DASHBOARD API - Error Occurred');
        console.error('💥 ============================================');
        console.error('Error details:', error);
        console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }

        return handleError(error);
    }
}