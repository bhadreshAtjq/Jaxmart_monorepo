const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          buyerOrders: true,
          sellerOrders: true
        }
      }
    }
  });
  
  users.forEach(u => {
    console.log(`${u.fullName} (ID: ${u.id})`);
    console.log(`  Purchases: ${u._count.buyerOrders}`);
    console.log(`  Sales:     ${u._count.sellerOrders}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
