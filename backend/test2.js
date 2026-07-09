const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({ 
    where: { category: { name: 'Fabric Cutting Machine' } },
    include: { category: true } 
  });
  
  if (listings.length > 0) {
    console.log('Sample listing Type for Fabric Cutting Machine:', listings[0].listingType);
    console.log('Sample listing Status:', listings[0].status);
    console.log('Sample listing Category ID:', listings[0].categoryId);
  } else {
    console.log('No listings found for Fabric Cutting Machine');
  }
}

main().finally(() => prisma.$disconnect());
