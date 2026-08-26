const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const listingCount = await prisma.listing.count();
  const mediaCount = await prisma.listingMedia.count();
  console.log({ usersCount, listingCount, mediaCount });

  const sampleListings = await prisma.listing.findMany({
    take: 5,
    include: { media: true, productDetail: true }
  });
  console.log('Sample Listings:', JSON.stringify(sampleListings, null, 2));
}

main().finally(() => prisma.$disconnect());
