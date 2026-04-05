import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const initializePrisma = () => {
    // 1. Prisma 7 adapter-based initialization for MySQL
    const adapter = new PrismaMariaDb({ 
        host: "127.0.0.1", 
        port: 3306, 
        user: "root", 
        password: "", 
        database: "xpense_share"
    });
    
    // 2. Construct client with adapter
    return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || initializePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
