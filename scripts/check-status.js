const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  console.log('USERS:', JSON.stringify(users, null, 2));

  const total = await prisma.testResult.count();
  console.log('TOTAL TEST RESULTS:', total);

  const byTester = await prisma.testResult.groupBy({
    by: ['testerId'],
    _count: true,
  });
  console.log('BY TESTER:', JSON.stringify(byTester, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
