// import { PrismaClient } from '@prisma/client'
const { PrismaClient } = require("@prisma/client");
const prismaClientSingleton = async () => {
  let prismaClient;
  if (!prismaClient) {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
  }
  return new PrismaClient();
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

module.exports = prisma;
