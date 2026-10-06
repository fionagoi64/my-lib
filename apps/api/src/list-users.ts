import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  console.log('--------------------------------------------------');
  console.log('👥 Current Users in Database:');
  users.forEach((u) => {
    console.log(`- Email: ${u.email} | Name: ${u.firstName} ${u.lastName || ''} | Role: ${u.role?.name}`);
  });
  console.log('--------------------------------------------------');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
