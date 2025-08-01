import { NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { create } from "./handlers/create";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (body.action === "create") {
            return create(body);
        } else {
            throw new AppError(400, 'Invalid action');
        }
    } catch (error) {
        return handleError(error);
    }
}