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
  // 1. Create categories
  const classics = await prisma.category.upsert({
    where: { name: 'Classics' },
    update: {},
    create: {
      name: 'Classics',
      description:
        'Timeless literary masterpieces and traditional standard works.',
    },
  });

  const sciFi = await prisma.category.upsert({
    where: { name: 'Science Fiction' },
    update: {},
    create: {
      name: 'Science Fiction',
      description:
        'Futuristic science, space exploration, and fantasy speculative fiction.',
    },
  });

  const history = await prisma.category.upsert({
    where: { name: 'History' },
    update: {},
    create: {
      name: 'History',
      description: 'Biographies, historic accounts, and cultural chronicles.',
    },
  });

  console.log('🗂️ Categories seeded successfully.');

  // 2. Create books
  const booksToSeed = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      description:
        'A story of the wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
      stockTotal: 5,
      stockAvailable: 5,
      categoryId: classics.id,
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      description:
        'The story of young Scout Finch and her attorney father Atticus defending a black man in the deep South.',
      stockTotal: 3,
      stockAvailable: 3,
      categoryId: classics.id,
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441172719',
      description:
        'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the Messiah.',
      stockTotal: 8,
      stockAvailable: 8,
      categoryId: sciFi.id,
    },
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '9780062316097',
      description:
        'A narrative of humanity’s creation and evolution, exploring how history has shaped our societies.',
      stockTotal: 4,
      stockAvailable: 4,
      categoryId: history.id,
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524935',
      description:
        'A dystopian novel set in a totalitarian society ruled by Big Brother.',
      stockTotal: 6,
      stockAvailable: 6,
      categoryId: classics.id,
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '9780141439518',
      description:
        'A classic romance exploring manners, upbringing, morality, and marriage.',
      stockTotal: 4,
      stockAvailable: 4,
      categoryId: classics.id,
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '9780547928227',
      description:
        'The adventure of Bilbo Baggins as he seeks to reclaim the lonely mountain.',
      stockTotal: 7,
      stockAvailable: 7,
      categoryId: sciFi.id,
    },
    {
      title: 'Neuromancer',
      author: 'William Gibson',
      isbn: '9780441569595',
      description:
        'A landmark cyberpunk novel introducing case, a washed-up computer hacker.',
      stockTotal: 3,
      stockAvailable: 3,
      categoryId: sciFi.id,
    },
    {
      title: 'The Guns of August',
      author: 'Barbara W. Tuchman',
      isbn: '9780345386236',
      description:
        'A brilliant military history of the fateful month that launched World War I.',
      stockTotal: 2,
      stockAvailable: 2,
      categoryId: history.id,
    },
    {
      title: 'Team of Rivals',
      author: 'Doris Kearns Goodwin',
      isbn: '9780743270755',
      description:
        'A biographical study of Abraham Lincoln and the men who served in his cabinet.',
      stockTotal: 5,
      stockAvailable: 5,
      categoryId: history.id,
    },
  ];

  console.log('📚 Seeding books...');
  for (const b of booksToSeed) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {
        stockTotal: b.stockTotal,
        stockAvailable: b.stockAvailable,
        categoryId: b.categoryId,
        description: b.description,
      },
      create: b,
    });
    console.log(`- Upserted: "${b.title}" by ${b.author}`);
  }

  console.log('--------------------------------------------------');
  console.log('🎉 Starter Book Catalog Seeded Successfully!');
  console.log('--------------------------------------------------');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
