const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({datasources:{db:{url:'postgresql://postgres:postgres@localhost:5432/postgres'}}});
p.$connect().then(()=>console.log('Local works')).catch(e=>console.log('Local fails', e.message));
