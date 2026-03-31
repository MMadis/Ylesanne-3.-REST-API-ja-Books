import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaClientSingleton: PrismaClient | undefined;
}

const prisma = global.prismaClientSingleton ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaClientSingleton = prisma;
}

export { prisma };
