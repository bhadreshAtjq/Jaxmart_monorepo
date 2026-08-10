const { PrismaClient } = require('@prisma/client');
async function test() {
  const prisma1 = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:QdLtuLWzxotutsFMASfOKqdcCwBlWMin@mainline.proxy.rlwy.net:36460/railway' } } });
  try {
    await prisma1.$connect();
    console.log('Mainline: Success');
    await prisma1.$disconnect();
  } catch (e) {
    console.error('Mainline: Failed', e.message);
  }

  const prisma2 = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:sUKlLJyVFuzGEcIJYlmpRUYCKtHQjSjZ@trolley.proxy.rlwy.net:43611/railway' } } });
  try {
    await prisma2.$connect();
    console.log('Trolley: Success');
    await prisma2.$disconnect();
  } catch (e) {
    console.error('Trolley: Failed', e.message);
  }
}
test();
