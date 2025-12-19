# 🚀 Quick Start - Dine-Dash SQLite

## Windows Installation Fix

The `better-sqlite3` package requires Python compilation on Windows. I've switched to `sql.js` which is pure JavaScript.

## Run Your Application

### Option 1: Double-click batch file
```
install-and-run.bat
```

### Option 2: Manual commands
```bash
npm install
npm run dev
```

### Option 3: If npm issues
```
run-server.bat
```

## What Happens
1. Installs `sql.js` (pure JavaScript SQLite)
2. Creates `database.sqlite` automatically
3. Seeds with restaurant data
4. Starts server on http://localhost:5000

## Access Points
- **Frontend**: http://localhost:5000
- **Admin**: http://localhost:5000/admin/login (admin/admin123)
- **API**: http://localhost:5000/api/*

## Seeded Data Ready
- 10 menu items with realistic prices
- 8 restaurant tables with QR codes  
- 4 categories (Appetizers, Mains, Desserts, Drinks)
- Admin user for management

## If Still Issues
1. Delete `node_modules` folder
2. Run `npm install` again
3. Try `run-server.bat`

Your restaurant app will work perfectly with SQLite! 🍽️