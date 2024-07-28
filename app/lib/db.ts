import { PrismaClient } from "@prisma/client";

// If in production environment, return new primsaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// if not in production environment / if in development environment,  binds prisma to global file
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
