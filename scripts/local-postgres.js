const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

async function run() {
  const dataDir = path.join(__dirname, '..', '.postgres-data');
  const exists = fs.existsSync(dataDir);

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    persistent: true,
  });

  if (!exists) {
    console.log('Initializing PostgreSQL database cluster...');
    await pg.initialise();
  }

  console.log('Starting PostgreSQL on port 5432...');
  await pg.start();
  console.log('PostgreSQL is running on localhost:5432');

  try {
    await pg.createDatabase('qc_checklist');
    console.log('Database qc_checklist ready.');
  } catch (err) {
    if (!err.message?.includes('already exists')) {
      console.log('createDatabase info:', err.message);
    }
  }

  console.log('PostgreSQL cluster is ready to accept connections.');

  // Keep process alive
  setInterval(() => {}, 10000);
}

run().catch((err) => {
  console.error('Failed to run PostgreSQL:', err);
  process.exit(1);
});
