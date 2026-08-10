const { Client } = require('pg');

async function checkPgAdminDetails() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jadequest%403009@localhost:5432/jaxmart_db?schema=public'
  });

  try {
    await client.connect();
    console.log('--- PGADMIN CONNECTION PARAMETERS ---');
    console.log('Host: localhost (or 127.0.0.1)');
    console.log('Port: 5432');
    console.log('User: postgres');
    console.log('Password: Jadequest@3009');
    console.log('Database Name: jaxmart_db');
    console.log('Schema Name: public');

    const res = await client.query('SELECT COUNT(*) FROM public.listings;');
    console.log(`\nTable "public.listings" Total Rows: ${res.rows[0].count}`);

    const resUsers = await client.query('SELECT COUNT(*) FROM public.users;');
    console.log(`Table "public.users" Total Rows: ${resUsers.rows[0].count}`);

    const resCategories = await client.query('SELECT COUNT(*) FROM public.categories;');
    console.log(`Table "public.categories" Total Rows: ${resCategories.rows[0].count}`);
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

checkPgAdminDetails();
