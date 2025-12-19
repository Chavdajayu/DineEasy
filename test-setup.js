// Simple test to verify SQLite setup works
const Database = require('better-sqlite3');
const path = require('path');

console.log('Testing SQLite setup...');

try {
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  console.log('✅ SQLite database connection successful');
  
  // Test basic operations
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_table (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  
  const insert = db.prepare('INSERT INTO test_table (name) VALUES (?)');
  const result = insert.run('test');
  console.log('✅ Insert operation successful, ID:', result.lastInsertRowid);
  
  const select = db.prepare('SELECT * FROM test_table WHERE id = ?');
  const row = select.get(result.lastInsertRowid);
  console.log('✅ Select operation successful:', row);
  
  // Clean up
  db.exec('DROP TABLE test_table');
  db.close();
  
  console.log('✅ All SQLite operations working correctly!');
  console.log('\nYou can now run: npm run dev');
  
} catch (error) {
  console.error('❌ SQLite setup error:', error.message);
  process.exit(1);
}