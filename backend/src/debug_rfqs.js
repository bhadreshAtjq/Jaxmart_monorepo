const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rfqs = await prisma.rfqRequest.findMany({
    select: { id: true, title: true, status: true }
  });
  console.log(JSON.stringify(rfqs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
