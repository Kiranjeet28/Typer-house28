import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'AppError';
    }
}

export function handleError(error: unknown) {
    if (error instanceof AppError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else if (error instanceof ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    } else {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
