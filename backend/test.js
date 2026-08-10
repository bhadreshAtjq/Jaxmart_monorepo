const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({ 
    where: { status: 'ACTIVE' },
    include: { category: true, seller: true } 
  });
  console.log('Total ACTIVE listings:', listings.length);
  
  if (listings.length > 0) {
    const cats = {};
    for (let l of listings) {
      if (!cats[l.category.name]) cats[l.category.name] = 0;
      cats[l.category.name]++;
    }
    console.log('Active Listings by Category:', cats);
  }
}

main().finally(() => prisma.$disconnect());
