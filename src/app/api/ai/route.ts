import { NextResponse } from 'next/server';
import { AppError, handleError } from "@/lib/error";
import { getAllUserData } from './handlers/getAll';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (body.action === "getAll") {
            return getAllUserData(body);
        } else {
            throw new AppError(400, 'Invalid action');
        }
    } catch (error) {
        return handleError(error);
    }
}