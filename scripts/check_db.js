const { PrismaClient } = require('@prisma/client');
const path = require('path');
process.env.DATABASE_URL = 'file:' + path.resolve(__dirname, '../prisma/dev.db');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table';");
  console.log('ALL TABLES:', tables.map(t => t.name));
  for (const t of tables) {
    if (t.name.startsWith('_')) continue;
    try {
      const res = await prisma.$queryRawUnsafe(`SELECT count(*) as c FROM "${t.name}"`);
      const count = Number(res[0].c);
      if (count > 0) {
        console.log(`Table ${t.name}: ${count} rows`);
        const sample = await prisma.$queryRawUnsafe(`SELECT * FROM "${t.name}" LIMIT 3`);
        console.log(`Sample from ${t.name}:`, JSON.stringify(sample, null, 2));
      }
    } catch(err) {
      console.error(`Error querying ${t.name}:`, err.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
