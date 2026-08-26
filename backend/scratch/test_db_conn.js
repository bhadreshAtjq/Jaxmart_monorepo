const { PrismaClient } = require('@prisma/client');

async function check(url, name) {
  console.log(`Testing ${name}...`);
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    await p.$connect();
    console.log(`>>> ${name}: CONNECTED SUCCESS`);
  } catch (e) {
    console.log(`>>> ${name}: FAILED - ${e.message.split('\n')[0]}`);
  } finally {
    await p.$disconnect();
  }
}

async function main() {
  const passwords = [
    'Jadequest%403009',
    'Jadequest@3009',
    'postgres',
    'admin',
    'root',
    '123456',
    'password',
    '1234'
  ];

  for (const pw of passwords) {
    const url = `postgresql://postgres:${pw}@localhost:5432/jaxmart_db?schema=public`;
    await check(url, `Localhost (pw: ${pw})`);
  }
  
  // also test without database name (default postgres db)
  for (const pw of ['Jadequest%403009', 'Jadequest@3009', 'postgres', 'admin', 'root', '123456']) {
    const url = `postgresql://postgres:${pw}@localhost:5432/postgres?schema=public`;
    await check(url, `Localhost default db (pw: ${pw})`);
  }
}

main();
