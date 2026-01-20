import { PrismaClient, TextLength } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

/* ================= CONFIG ================= */

const USERS = 10000;
const ROOMS_PER_USER = 5;
const CHARS = [..."abcdefghijklmnopqrstuvwxyz", " "];

/* ================= UTILS ================= */

const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

/* ================= CLEAN ================= */

async function cleanDatabase() {
    await prisma.characterPerformance.deleteMany();
    await prisma.typingSpeed.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
}

/* ================= CORE ================= */

async function createUserWithRooms(userIndex: number) {

    // user starts mostly beginner
    let skill = faker.number.int({ min: 20, max: 40 });

    // timeline start
    let currentDate = faker.date.past({ years: 1 });

    const user = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: `user_${userIndex}@seed.dev`,
            username: `user_${userIndex}_${faker.string.alphanumeric(4)}`,
            createdAt: currentDate,
        },
    });

    for (let r = 0; r < ROOMS_PER_USER; r++) {

        // advance time
        currentDate = faker.date.soon({
            days: faker.number.int({ min: 1, max: 4 }),
            refDate: currentDate,
        });

        // skill progression
        skill = clamp(skill + faker.number.int({ min: -2, max: 5 }), 10, 100);

        const duration = faker.number.int({ min: 60, max: 180 });

        const room = await prisma.room.create({
            data: {
                name: `Room ${r + 1}`,
                creatorId: user.id,
                joinCode: faker.string.alphanumeric(6),
                maxPlayers: 1,
                expiresAt: faker.date.soon({ days: 1 }),
                textLength: faker.helpers.enumValue(TextLength),
                timeLimit: duration,
                createdAt: currentDate,
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

        /* ================= CHARACTER PERFORMANCE FIRST ================= */

        let totalChars = 0;
        let totalErrors = 0;
        let totalTimeMs = 0;

        const charPerfData = CHARS.map((char) => {

            // better skill = faster + fewer errors
            const avgTime = faker.number.float({
                min: 700 - skill * 4,
                max: 900 - skill * 3,
            });

            const errors = faker.number.int({
                min: 0,
                max: Math.max(1, 6 - Math.floor(skill / 20)),
            });

            const count = faker.number.int({ min: 20, max: 80 });

            totalChars += count;
            totalErrors += errors;
            totalTimeMs += avgTime * count;

            return {
                char,
                avgTimePerChar: avgTime,
                maxTimePerChar: avgTime * faker.number.float({ min: 1.3, max: 1.8 }),
                errorFrequency: errors,
                userId: user.id,
                typingSpeedId: room.id,

            };
        });

        await prisma.characterPerformance.createMany({
            data: charPerfData,
        });

        /* ================= CALCULATE WPM FROM CHAR DATA ================= */

        const effectiveChars = Math.max(0, totalChars - totalErrors);
        const words = effectiveChars / 5;
        const durationSeconds = duration;
        const wpm = Math.round((words / durationSeconds) * 60);

        await prisma.typingSpeed.create({
            data: {
                userId: user.id,
                roomId: room.id,
                wpm,
                correctword: Math.round(words),
                duration,
                userStatus: "ACTIVE",
                createdAt: currentDate,
            },
        });
    }
}

/* ================= MAIN ================= */

async function main() {
    console.log("🌱 Seeding started");

    await cleanDatabase();

    for (let i = 0; i < USERS; i++) {
        await createUserWithRooms(i);

        if (i % 50 === 0) {
            console.log(`✅ Users created: ${i}/${USERS}`);
        }
    }

    console.log("🎉 Seeding completed");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
