import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  let userRole = await prisma.role.findUnique({
    where: { name: 'USER' },
  });

  if (!userRole) {
    userRole = await prisma.role.create({
      data: {
        name: 'USER',
        description: 'Standard Library Reader',
      },
    });
  }

  const email = 'fiona@gmail.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName: 'Fiona',
      lastName: 'Goi',
      roleId: userRole.id,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Fiona',
      lastName: 'Goi',
      roleId: userRole.id,
    },
  });
  console.log('--------------------------------------------------');
  console.log('🎉 Default Reader Account Seeded & Synced Successfully!');
  console.log(`📧 Email:    ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('--------------------------------------------------');
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
