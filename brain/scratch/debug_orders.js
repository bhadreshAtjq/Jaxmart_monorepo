const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allOrders = await prisma.order.findMany({
    include: {
      buyer: { select: { fullName: true } },
      seller: { select: { fullName: true } }
    }
  });
  console.log(JSON.stringify(allOrders, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
