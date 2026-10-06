import { execSync } from 'child_process';
import path from 'path';

function main() {
  console.log('Running master seed script...');
  const scripts = [
    'src/seed-admin.ts',
    'src/seed-reader.ts',
    'src/seed-books.ts',
    'src/seed-rules.ts',
  ];

  for (const script of scripts) {
    const scriptPath = path.resolve(__dirname, '..', script);
    console.log(`\n--- Executing ${script} ---`);
    execSync(`npx ts-node ${scriptPath}`, { stdio: 'inherit' });
  }
  console.log('\n🌱 Master seed script finished successfully!');
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
