const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { businessProfile: true }
  });
  console.log('=== Database Users ===');
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`Phone: ${u.phone}`);
    console.log(`Name: ${u.fullName}`);
    console.log(`Email: ${u.email}`);
    console.log(`UserType: ${u.userType}`);
    console.log(`AccountType: ${u.accountType}`);
    console.log(`KYC: ${u.kycStatus}`);
    console.log(`BusinessProfile:`, u.businessProfile);
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
