import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserCreate } from '../schema';

export async function create(body: Object) {
    try {
        const data = UserCreate.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return NextResponse.json({
                message: 'User already exists',
                user: existingUser
            });
        }

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                image: data.image,
            },
        });

        return NextResponse.json({ message: 'User created successfully', user });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({
                message: 'Validation failed',
                errors: error.errors
            }, { status: 400 });
        }
        return NextResponse.json({
            message: 'Failed to create user',
            error: error.message
        }, { status: 500 });
    }
}