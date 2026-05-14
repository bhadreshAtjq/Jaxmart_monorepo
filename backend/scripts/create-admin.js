const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  const phone = process.argv[2];
  const fullName = process.argv[3] || 'System Admin';

  if (!phone) {
    console.error('Usage: node scripts/create-admin.js <phone_number> [full_name]');
    process.exit(1);
  }

  try {
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        isAdmin: true,
      },
      create: {
        phone,
        fullName,
        isAdmin: true,
        userType: 'BUYER', // Default
      },
    });

    console.log('✅ Admin User Processed:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Admin: ${user.isAdmin}`);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
