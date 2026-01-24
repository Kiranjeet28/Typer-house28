import { NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { getAll } from './handlers/getAll';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (body.action === "getAll") {
            return await getAll(body);
        } else {
            throw new AppError(400, 'Invalid action');
        }
    } catch (error) {
        return handleError(error);
    }
}