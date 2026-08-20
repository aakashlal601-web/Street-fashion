// Creates or updates an admin account directly in the database.
// Run this locally (pointed at your DATABASE_URL) — it is never bundled into
// the deployed app, so credentials never touch frontend code or a git repo.
//
// Usage:
//   npm run create-admin -- --username admin --password 'a-strong-unique-password'
//
// If you omit --password, you'll be prompted for one (note: input is NOT
// masked by this simple script — run it in a private terminal, or pass
// --password directly in a shell session that isn't logged/shared).

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username') out.username = args[++i];
    if (args[i] === '--password') out.password = args[++i];
  }
  return out;
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const args = parseArgs();
  const username = args.username || (await prompt('Admin username: '));
  const password = args.password || (await prompt('Admin password (min 12 chars): '));

  if (!username || username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (!password || password.length < 12) {
    throw new Error('Password must be at least 12 characters. Use a real passphrase, not the demo one.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Admin account ready for "${admin.username}". You can now log in at /admin/login.`);
}

main()
  .catch((e) => {
    console.error('Failed to create admin:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
