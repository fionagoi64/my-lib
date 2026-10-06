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
  // Find the seeded Admin user to set as the creator of these rules
  const admin = await prisma.user.findFirst({
    where: {
      role: {
        name: 'ADMIN',
      },
    },
  });

  if (!admin) {
    console.error('❌ Could not seed rules: No ADMIN user found in database. Run seed-admin first!');
    return;
  }

  const defaultRules = [
    {
      title: '📚 What is my maximum borrowing quota?',
      content: 'Standard reader accounts are permitted to have up to 5 active physical book loans checked out concurrently. If you reach this limit, you must return at least one active book before checking out new titles.',
    },
    {
      title: '⏳ How long can I keep a borrowed book?',
      content: 'All book check-outs are valid for a default duration of 14 calendar days. A courtesy warning is shown under your "My Loans" tab as the due date approaches.',
    },
    {
      title: '🔄 Can I extend/renew my loan period?',
      content: 'Yes, active loans can be extended a maximum of 2 times. Each extension adds +7 additional calendar days to your current due date. Note that extensions must be requested before the book becomes overdue.',
    },
    {
      title: '⚠️ What happens if a book is overdue?',
      content: 'If any borrowed book exceeds its due date, your borrowing privileges are temporarily suspended. You will be unable to borrow new titles or request extensions until all overdue copies are safely returned.',
    },
    {
      title: '📢 How and where do I pick up my books?',
      content: 'Once requested online, books are held at the Library Hall Main Counter for up to 48 hours. Please present your digital Reader Profile or photo ID to the librarian to collect your physical copies.',
    },
  ];

  console.log('--------------------------------------------------');
  console.log('🌱 Seeding Library Regulations FAQ...');

  for (const rule of defaultRules) {
    await prisma.libraryRule.upsert({
      where: {
        id: defaultRules.indexOf(rule) + 1,
      },
      update: {
        title: rule.title,
        content: rule.content,
        updatedBy: admin.id,
      },
      create: {
        id: defaultRules.indexOf(rule) + 1,
        title: rule.title,
        content: rule.content,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    });
    console.log(`✅ Seeded Rule: "${rule.title}"`);
  }

  console.log('🎉 Library Regulations Seeded & Synced Successfully!');
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
