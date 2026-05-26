const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating all users to KYC status: VERIFIED...');
  const result = await prisma.user.updateMany({
    data: {
      kycStatus: 'VERIFIED',
    },
  });
  console.log(`Successfully updated ${result.count} user(s) to VERIFIED.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
