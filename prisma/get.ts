import { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }
}

function writeCSV(filename: string, data: any[]) {
    if (data.length === 0) return;

    const parser = new Parser();
    const csv = parser.parse(data);

    fs.writeFileSync(
        path.join(DATA_DIR, filename),
        csv
    );

    console.log(`✅ ${filename} exported`);
}

async function main() {
    ensureDir();

    writeCSV("user.csv", await prisma.user.findMany());
    writeCSV("room.csv", await prisma.room.findMany());
    writeCSV("roomMember.csv", await prisma.roomMember.findMany());
    writeCSV("typingSpeed.csv", await prisma.typingSpeed.findMany());
    writeCSV("characterPerformance.csv", await prisma.characterPerformance.findMany());
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
