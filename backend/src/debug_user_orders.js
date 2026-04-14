const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accountPhone = '9998887776'; // Global Exports Corp
  const user = await prisma.user.findUnique({ where: { phone: accountPhone } });
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  console.log(`User ID: ${user.id} (${user.fullName})`);
  
  const buyerOrders = await prisma.order.findMany({ where: { buyerId: user.id } });
  const sellerOrders = await prisma.order.findMany({ where: { sellerId: user.id } });
  
  console.log(`Buyer Orders: ${buyerOrders.length}`);
  console.log(`Seller Orders: ${sellerOrders.length}`);
  
  if (sellerOrders.length > 0) {
    console.log("Seller Orders Data:");
    console.log(JSON.stringify(sellerOrders, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
