import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

const prisma = global.cachedPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.cachedPrisma = prisma;
}

export { prisma };
export default prisma;
