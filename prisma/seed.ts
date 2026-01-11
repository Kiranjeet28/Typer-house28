import { PrismaClient, TextLength } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const USERS = 500;               // ⛔ change later
const ROOMS_PER_USER = 5;
const BATCH_SIZE = 25;

// Reduced but meaningful set (huge speedup)
const CHARS = ["a", "s", "d", "f", "j", "k", "l", " "];

async function createUserWithRooms() {
    const user = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            username: faker.internet.username(),
        },
    });

    const roomPromises = Array.from({ length: ROOMS_PER_USER }).map(async () => {
        const room = await prisma.room.create({
            data: {
                name: faker.word.words(2),
                description: faker.lorem.sentence(),
                creatorId: user.id,
                joinCode: faker.string.alphanumeric(6),
                maxPlayers: faker.number.int({ min: 2, max: 6 }),
                expiresAt: faker.date.soon({ days: 2 }),
                textLength: faker.helpers.enumValue(TextLength),
                timeLimit: faker.number.int({ min: 30, max: 300 }),
            },
        });

        await prisma.roomMember.create({
            data: {
                roomId: room.id,
                userId: user.id,
                role: "CREATOR",
                status: "FINISHED",
            },
        });

        const typingSpeed = await prisma.typingSpeed.create({
            data: {
                userId: user.id,
                roomId: room.id,
                wpm: faker.number.int({ min: 30, max: 140 }),
                correctword: faker.number.int({ min: 20, max: 120 }),
                duration: faker.number.int({ min: 30, max: 300 }),
                userStatus: "ACTIVE",
            },
        });

        await prisma.characterPerformance.createMany({
            data: CHARS.map((char) => ({
                char,
                avgTimePerChar: faker.number.float({ min: 80, max: 350 }),
                maxTimePerChar: faker.number.float({ min: 200, max: 800 }),
                errorFrequency: faker.number.int({ min: 0, max: 5 }),
                typingSpeedId: typingSpeed.id,
                userId: user.id,
            })),
        });
    });

    await Promise.all(roomPromises);
}

async function main() {
    console.log("🌱 Seeding started...");

    for (let i = 0; i < USERS; i += BATCH_SIZE) {
        const batch = Array.from({ length: BATCH_SIZE }).map(() =>
            createUserWithRooms()
        );

        await Promise.all(batch);

        console.log(`✅ Users created: ${Math.min(i + BATCH_SIZE, USERS)}/${USERS}`);
    }

    console.log("🌱 Seeding completed");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
