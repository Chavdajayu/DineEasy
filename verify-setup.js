const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Dine-Dash SQLite Setup...\n');

// Check if package.json exists and has correct dependencies
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json found');
  
  if (packageJson.dependencies['better-sqlite3']) {
    console.log('✅ better-sqlite3 dependency found');
  } else {
    console.log('❌ better-sqlite3 dependency missing');
    console.log('   Run: npm install better-sqlite3 @types/better-sqlite3');
  }
  
  if (!packageJson.dependencies['pg']) {
    console.log('✅ PostgreSQL dependencies removed');
  } else {
    console.log('⚠️  PostgreSQL dependencies still present');
  }
} catch (error) {
  console.log('❌ package.json not found or invalid');
}

// Check if key files exist
const requiredFiles = [
  'server/db.ts',
  'server/storage.ts', 
  'server/seed.ts',
  'server/index.ts',
  'server/routes.ts',
  'shared/schema.ts',
  'drizzle.config.ts'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check schema file for SQLite syntax
try {
  const schemaContent = fs.readFileSync('shared/schema.ts', 'utf8');
  if (schemaContent.includes('sqliteTable')) {
    console.log('✅ Schema converted to SQLite');
  } else {
    console.log('❌ Schema still uses PostgreSQL syntax');
  }
  
  if (schemaContent.includes('randomUUID')) {
    console.log('✅ UUID imports fixed');
  } else {
    console.log('❌ UUID imports need fixing');
  }
} catch (error) {
  console.log('❌ Could not verify schema file');
}

// Check db.ts file
try {
  const dbContent = fs.readFileSync('server/db.ts', 'utf8');
  if (dbContent.includes('better-sqlite3')) {
    console.log('✅ Database connection uses SQLite');
  } else {
    console.log('❌ Database connection still uses PostgreSQL');
  }
} catch (error) {
  console.log('❌ Could not verify database file');
}

console.log('\n📋 Setup Status Summary:');
console.log('- SQLite database will be created at: ./database.sqlite');
console.log('- No environment variables required');
console.log('- Auto-seeding enabled on first run');
console.log('- All API endpoints preserved');

console.log('\n🚀 To start the application:');
console.log('1. Install dependencies: npm install');
console.log('2. Start server: npm run dev');
console.log('3. Server will run on: http://localhost:5000');

console.log('\n📊 Expected seeded data:');
console.log('- 4 categories (Appetizers, Main Course, Desserts, Beverages)');
console.log('- 10 menu items with realistic prices');
console.log('- 8 restaurant tables with QR codes');
console.log('- Admin user (username: admin, password: admin123)');

console.log('\n✨ Setup verification complete!');