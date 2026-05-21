const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repair() {
  try {
    const users = await prisma.user.findMany({
      where: {
        phone: {
          length: 10
        }
      }
    });
    console.log(`Found ${users.length} users with 10-digit numbers.`);
  } catch (err) {
    // Prisma doesn't support 'length' in where directly, using raw query
    const results = await prisma.$queryRaw`SELECT id, phone FROM users WHERE length(phone) = 10`;
    console.log(`Found ${results.length} users with 10-digit numbers via raw query.`);
    
    for (const u of results) {
      const newPhone = '91' + u.phone;
      const duplicate = await prisma.user.findUnique({ where: { phone: newPhone } });
      
      if (duplicate) {
        console.log(`Conflict: ${u.phone} -> ${newPhone}. New account ${duplicate.id} already exists.`);
        // If the new account is empty (no listings), we can delete it and update the old one
        const listings = await prisma.listing.count({ where: { sellerId: duplicate.id } });
        if (listings === 0) {
          console.log(`Deleting empty duplicate account ${duplicate.id}...`);
          await prisma.user.delete({ where: { id: duplicate.id } });
          await prisma.user.update({ where: { id: u.id }, data: { phone: newPhone } });
          console.log(`Updated ${u.id} to ${newPhone}`);
        } else {
          console.log(`Warning: Duplicate account ${duplicate.id} has data! Manual merge required.`);
        }
      } else {
        await prisma.user.update({ where: { id: u.id }, data: { phone: newPhone } });
        console.log(`Migrated ${u.phone} -> ${newPhone}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

repair();
