import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local in the root workspace directory
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment or .env.local');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create ADMIN role if missing
  let adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Super Administrator',
      },
    });
  }

  // 2. Create USER role if missing
  let userRole = await prisma.role.findUnique({
    where: { name: 'USER' },
  });

  if (!userRole) {
    userRole = await prisma.role.create({
      data: {
        name: 'USER',
        description: 'Standard Reader',
      },
    });
  }

  // 3. Create default admin user
  const email = 'admin@library.com';
  const password = 'adminpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName: 'Library',
      lastName: 'Admin',
      roleId: adminRole.id,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Library',
      lastName: 'Admin',
      roleId: adminRole.id,
    },
  });
  console.log('--------------------------------------------------');
  console.log('🎉 Default Administrator Seeded & Synced Successfully!');
  console.log(`📧 Email:    ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
