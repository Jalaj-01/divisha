import { InMemoryDatabase } from './memory-store.js';
import { PrismaClient } from '@prisma/client';

export * from './seed-data.js';
export * from './memory-store.js';

// Export memory database singleton
export const db = InMemoryDatabase.getInstance();

// Prisma Client singleton loader
let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const isDev = typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env?.NODE_ENV === 'development';
    prismaInstance = new PrismaClient({
      log: isDev ? ['query', 'error', 'warn'] : ['error']
    });
  }
  return prismaInstance;
}
