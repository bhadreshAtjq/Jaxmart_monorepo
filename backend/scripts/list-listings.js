const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    take: 5,
    select: { id: true, title: true, listingType: true }
  });
  console.log('=== Database Listing IDs ===');
  listings.forEach(l => {
    console.log(`Title: ${l.title}`);
    console.log(`Type:  ${l.listingType}`);
    console.log(`ID:    ${l.id}`);
    console.log('----------------------');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
