require('dotenv').config();

console.log('--- DATABASE CONNECTION VERIFICATION ---');
console.log('DATABASE_URL from .env:', process.env.DATABASE_URL);

const { prisma } = require('../src/config/database');

async function verify() {
  try {
    const listingsCount = await prisma.listing.count();
    const usersCount = await prisma.user.count();
    const categoriesCount = await prisma.category.count();
    const productDetailsCount = await prisma.productDetail.count();

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Listings Count:', listingsCount);
    console.log('Users Count:', usersCount);
    console.log('Categories Count:', categoriesCount);
    console.log('Product Details Count:', productDetailsCount);

    if (listingsCount >= 8028) {
      console.log('\nSUCCESS: Database fully loaded and operational!');
    } else {
      console.log('\nWARNING: Unexpected row count:', listingsCount);
    }
  } catch (err) {
    console.error('VERIFICATION ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
