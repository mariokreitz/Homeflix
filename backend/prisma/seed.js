import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { SEED_DEMO_PASSWORD, SEED_DEMO_USER } from '../src/config/env.config.js';
import { consoleLogger } from '../src/services/logger.service.js';

dotenv.config();

const prisma = new PrismaClient();

const DEMO_USER = SEED_DEMO_USER;
const DEMO_PASSWORD = SEED_DEMO_PASSWORD;

async function createUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            isActive: true,
            lastLoginAt: null,
            failedLoginAttempts: 0,
        },
    });

    consoleLogger.info(`DEMO user created: ${user.email}`);
    return user;
}

async function main() {
    consoleLogger.info('Starting database seeding...');

    try {
        await createUser(DEMO_USER, DEMO_PASSWORD);
        consoleLogger.info('Database seeding complete');
    } catch (error) {
        consoleLogger.error('Error during database seeding:', error);
        throw error;
    }
}

main()
    .catch((error) => {
        consoleLogger.error('Database seeding failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        consoleLogger.info('Database seeding complete');
    });