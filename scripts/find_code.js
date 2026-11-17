const { PrismaClient } = require('@prisma/client');
const path = require('path');
process.env.DATABASE_URL = 'file:' + path.resolve(__dirname, '../prisma/dev.db');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table';");
  for (const t of tables) {
    if (t.name.startsWith('_')) continue;
    try {
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${t.name}"`);
      const matches = rows.filter(r => JSON.stringify(r).includes('96845') || JSON.stringify(r).includes('54472'));
      if (matches.length > 0) {
        console.log(`FOUND in table ${t.name}:`, JSON.stringify(matches, null, 2));
      }
    } catch(err) {}
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
