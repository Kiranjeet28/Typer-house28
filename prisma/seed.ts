import { PrismaClient, TextLength } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

/* ================= CONFIG ================= */

const USERS = 10_000;
const ROOMS_PER_USER = 5;
const BATCH_SIZE = 25;

// a–z + space
const CHARS = [..."abcdefghijklmnopqrstuvwxyz", " "];

// global counter to guarantee uniqueness
let USER_COUNTER = 0;

/* ================= CLEAN DATABASE ================= */

async function cleanDatabase() {
    console.log("🧹 Cleaning database...");

    await prisma.characterPerformance.deleteMany();
    await prisma.typingSpeed.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Database cleaned");
}

/* ================= SEED LOGIC ================= */

async function createUserWithRooms() {
    const id = USER_COUNTER++;

    const user = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: `user_${id}@seed.dev`,
            username: `user_${id}_${faker.string.alphanumeric(4)}`,
        },
    });

    await Promise.all(
        Array.from({ length: ROOMS_PER_USER }).map(async () => {
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
        })
    );
}

/* ================= MAIN ================= */

async function main() {
    console.log("🌱 Seeding started");

    await cleanDatabase();

    for (let i = 0; i < USERS; i += BATCH_SIZE) {
        await Promise.all(
            Array.from({ length: BATCH_SIZE }).map(() =>
                createUserWithRooms()
            )
        );

        console.log(
            `✅ Users created: ${Math.min(i + BATCH_SIZE, USERS)}/${USERS}`
        );
    }

    console.log("🌱 Seeding completed successfully 🎉");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
