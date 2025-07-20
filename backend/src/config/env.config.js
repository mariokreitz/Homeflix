import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT ?? 3000;
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@db:5432/database';
const REDIS_URL = process.env.REDIS_URL ?? 'redis://redis:6379';
const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
const MORGAN_FORMAT = process.env.MORGAN_FORMAT ?? 'combined';
const MORGAN_LOG_FILE = process.env.MORGAN_LOG_FILE ?? path.join('logs', 'access.log');

export { PORT, REDIS_URL, DATABASE_URL, LOG_LEVEL, MORGAN_FORMAT, MORGAN_LOG_FILE };
