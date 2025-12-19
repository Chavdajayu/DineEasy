# SQLite Local Development Setup

## Overview
Your Dine-Dash project has been successfully refactored from PostgreSQL + Drizzle to SQLite + better-sqlite3 for local development.

## What Changed
- ✅ Removed PostgreSQL dependencies (`pg`, `connect-pg-simple`)
- ✅ Added SQLite dependencies (`better-sqlite3`, `@types/better-sqlite3`)
- ✅ Updated schema from PostgreSQL to SQLite syntax
- ✅ Replaced database connection with file-based SQLite
- ✅ Auto-creates `database.sqlite` in project root
- ✅ Auto-seeds realistic dummy data on first run
- ✅ All API endpoints remain unchanged
- ✅ No environment variables required

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The server will:
- Create `database.sqlite` automatically
- Initialize all database tables
- Seed with realistic dummy data
- Start on http://localhost:5000

### 3. Start the Frontend (if separate)
```bash
cd client
npm run dev
```

## Database Management

### Manual Seeding
If you need to re-seed the database:
```bash
# Via API endpoint
curl -X POST http://localhost:5000/api/seed

# Or via npm script
npm run db:seed
```

### Reset Database
To start fresh, simply delete the database file:
```bash
rm database.sqlite
```
The database will be recreated and seeded on next server start.

## Seeded Data

### Categories
- Appetizers (2 items)
- Main Course (4 items) 
- Desserts (2 items)
- Beverages (2 items)

### Sample Menu Items
- Crispy Spring Rolls ($8.99)
- Buffalo Chicken Wings ($12.99)
- Grilled Atlantic Salmon ($24.99)
- Garden Veggie Pasta ($16.99)
- Prime Ribeye Steak ($34.99)
- Thai Red Curry ($18.99)
- Molten Chocolate Cake ($9.99)
- Classic Tiramisu ($8.99)
- Fresh Lemonade ($4.99)
- Iced Coffee ($5.99)

### Tables
- 8 restaurant tables (1-8)
- Tables 1-4: 4-person capacity
- Tables 5-8: 6-person capacity
- All with QR codes generated

### Admin Access
- Username: `admin`
- Password: `admin123`

## API Endpoints (Unchanged)
All existing API endpoints work exactly the same:
- `GET/POST /api/tables`
- `GET/POST /api/categories`
- `GET/POST /api/menu-items`
- `GET/POST /api/addons`
- `GET/POST /api/orders`
- `POST /api/admin/login`
- `POST /api/seed`

## File Structure
```
├── database.sqlite          # SQLite database (auto-created)
├── server/
│   ├── db.ts               # SQLite connection & schema
│   ├── seed.ts             # Database seeding
│   ├── storage.ts          # Data access layer
│   └── routes.ts           # API routes
├── shared/
│   └── schema.ts           # SQLite schema definitions
└── drizzle.config.ts       # Drizzle SQLite config
```

## Development Notes
- Database uses WAL mode for better performance
- Foreign keys are enabled
- Timestamps stored as ISO strings
- JSON data stored as TEXT
- No cloud dependencies
- Perfect for local development

## Troubleshooting

### Database Issues
If you encounter database errors:
1. Delete `database.sqlite`
2. Restart the server
3. Database will be recreated automatically

### Missing Data
If tables are empty:
```bash
curl -X POST http://localhost:5000/api/seed
```

### Port Issues
Default port is 5000. Change in server startup if needed.

## Production Notes
This SQLite setup is designed for local development only. For production, consider:
- PostgreSQL or other production databases
- Proper environment variable management
- Database migrations
- Backup strategies