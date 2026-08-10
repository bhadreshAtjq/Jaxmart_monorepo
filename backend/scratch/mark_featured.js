const { Client } = require('pg');
const LOCAL_URL = 'postgresql://postgres:Jadequest%403009@localhost:5432/jaxmart_db?schema=public';

async function main() {
  const client = new Client({ connectionString: LOCAL_URL });
  await client.connect();

  console.log('Marking top 50 listings as featured...');
  const res = await client.query(`
    UPDATE listings 
    SET "isFeatured" = true 
    WHERE id IN (SELECT id FROM listings LIMIT 50);
  `);
  console.log(`Updated ${res.rowCount} listings to isFeatured = true!`);

  await client.end();
}

main();
