import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "TestResult" t
    SET division = u.role
    FROM "User" u
    WHERE t."testerId" = u.id AND t.division IS NULL;
  `);
  console.log('Backfill division updated rows:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
