import { PrismaClient } from '@prisma/client';

// Prevent creating a new Prisma Client on every hot-reload in dev,
// which would otherwise exhaust the database connection pool.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
