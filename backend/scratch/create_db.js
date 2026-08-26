const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to default postgres database.');
    
    // Check if jaxmart_db exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'jaxmart_db'");
    if (res.rows.length === 0) {
      console.log('Creating database jaxmart_db...');
      await client.query('CREATE DATABASE jaxmart_db');
      console.log('Database jaxmart_db created successfully!');
    } else {
      console.log('Database jaxmart_db already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }
}

createDb();
