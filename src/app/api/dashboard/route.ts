import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "./handlers/getRoom";
import { getAllGames } from "./handlers/getAllGames";
import { AppError, handleError } from "@/lib/error";
import { getAnalysis } from "./handlers/get-analysis";
import { isRateLimited, getRateLimitStatus } from '@/lib/middleware/rateLimit';
import { logApiRequest } from '@/lib/utils/logging';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        if (isRateLimited(request, 100, 60000)) {
            const status = getRateLimitStatus(request);
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((status.resetTime - Date.now()) / 1000)) } }
            );
        }

        const body = await request.json();
        logApiRequest('POST', '/api/dashboard', { action: body.action });

        // Validate that action exists
        if (!body.action) {
            throw new AppError(400, 'Missing action parameter');
        }

        switch (body.action) {
            case 'get-room': {
                const userData = await getRoom(body);
                const response = NextResponse.json({
                    success: true,
                    data: userData
                });
                // Cache for 10 seconds
                response.headers.set('Cache-Control', 'public, max-age=10');
                return response;
            }

            case "get-analysis": {
                const analysisResult = await getAnalysis(body);
                const response = NextResponse.json({
                    success: true,
                    data: analysisResult
                });
                // Cache for 30 seconds
                response.headers.set('Cache-Control', 'public, max-age=30');
                return response;
            }

            case "get-all-games": {
                const games = await getAllGames(body);
                const response = NextResponse.json({ success: true, data: games });
                // Cache for 10 seconds
                response.headers.set('Cache-Control', 'public, max-age=10');
                return response;
            }

            default:
                throw new AppError(400, `Invalid action: ${body.action}`);
        }

    } catch (error) {
        return handleError(error);
    }
}