const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all active product listings...');
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE', listingType: 'PRODUCT' },
    select: { id: true, tags: true },
  });

  console.log(`Found ${listings.length} listings.`);
  
  if (listings.length < 300) {
    console.log('Not enough listings to tag 100 of each. Will tag as many as possible.');
  }

  // Shuffle array
  for (let i = listings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [listings[i], listings[j]] = [listings[j], listings[i]];
  }

  const analystsChoiceCount = Math.min(100, Math.floor(listings.length / 3));
  const lowMoqCount = Math.min(100, Math.floor(listings.length / 3));
  const oemCount = Math.min(100, Math.floor(listings.length / 3));

  let index = 0;
  
  console.log(`Assigning 'analysts-choice' to ${analystsChoiceCount} products...`);
  for (let i = 0; i < analystsChoiceCount; i++, index++) {
    const tags = Array.isArray(listings[index].tags) ? listings[index].tags : [];
    if (!tags.includes('analysts-choice')) {
      await prisma.listing.update({
        where: { id: listings[index].id },
        data: { tags: [...tags, 'analysts-choice'] }
      });
    }
  }

  console.log(`Assigning 'low-moq' to ${lowMoqCount} products...`);
  for (let i = 0; i < lowMoqCount; i++, index++) {
    const tags = Array.isArray(listings[index].tags) ? listings[index].tags : [];
    if (!tags.includes('low-moq')) {
      await prisma.listing.update({
        where: { id: listings[index].id },
        data: { tags: [...tags, 'low-moq'] }
      });
    }
  }

  console.log(`Assigning 'oem' to ${oemCount} products...`);
  for (let i = 0; i < oemCount; i++, index++) {
    const tags = Array.isArray(listings[index].tags) ? listings[index].tags : [];
    if (!tags.includes('oem')) {
      await prisma.listing.update({
        where: { id: listings[index].id },
        data: { tags: [...tags, 'oem'] }
      });
    }
  }

  console.log('Tagging complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
