import { NextRequest, NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { getAll } from './handlers/getAll';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log("📥 AI API received request:", body);

        // Validate action exists
        if (!body.action) {
            console.error("❌ Missing action in request");
            throw new AppError(400, 'Missing action parameter');
        }

        console.log("✅ Processing action:", body.action);

        if (body.action === "getAll") {
            // Call handler and get data object
            const result = await getAll(body);

            // Check if result contains an error
            if ('error' in result) {
                console.error("❌ Handler returned error:", result.error);
                return NextResponse.json(
                    {
                        success: false,
                        error: result.error
                    },
                    { status: result.status || 500 }
                );
            }

            // Success response
            console.log("✅ Returning success response");
            return NextResponse.json({
                success: true,
                ...result
            });

        } else {
            console.error("❌ Invalid action:", body.action);
            throw new AppError(400, `Invalid action: ${body.action}`);
        }

    } catch (error) {
        console.error("💥 Route handler error:", error);
        return handleError(error);
    }
}