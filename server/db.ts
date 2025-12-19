import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "database.sqlite");

let sqlDb: any;
let db: any;

async function initDb() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }
  
  db = drizzle(sqlDb, { schema });
  return db;
}

// Save database to file
export function saveDatabase() {
  if (sqlDb) {
    const data = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

// Auto-save every 5 seconds
setInterval(saveDatabase, 5000);

// Save on exit
process.on('exit', saveDatabase);
process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});

export async function getDb() {
  if (!db) {
    await initDb();
  }
  return db;
}

export { db };

// Initialize database schema
export async function initializeDatabase() {
  if (!db) {
    await initDb();
  }
  
  // Create tables if they don't exist
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff'
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      table_number INTEGER NOT NULL UNIQUE,
      capacity INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'available',
      qr_code TEXT,
      session_id TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      is_vegetarian INTEGER NOT NULL DEFAULT 0,
      is_vegan INTEGER NOT NULL DEFAULT 0,
      is_spicy INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1,
      preparation_time INTEGER DEFAULT 15,
      calories INTEGER
    );

    CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL REFERENCES tables(id),
      table_number INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'received',
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      special_instructions TEXT,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT,
      stripe_payment_intent_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
      menu_item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      spice_level INTEGER DEFAULT 0,
      selected_addons TEXT,
      special_instructions TEXT
    );
  `);
  
  saveDatabase();
}
