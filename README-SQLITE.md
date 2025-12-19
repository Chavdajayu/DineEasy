# 🍽️ Dine-Dash - SQLite Local Development

## ✅ Refactoring Complete!

Your Dine-Dash project has been successfully converted from PostgreSQL to SQLite for local development.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Access the Application
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5000 (served by backend in dev mode)

## 🔧 Verification Scripts

Run these to verify your setup:

```bash
# Verify setup is correct
node verify-setup.js

# Test SQLite connection
node test-setup.js

# Alternative server start (if npm issues)
node start-server.js
```

## 📊 What's Included

### Auto-Seeded Data
- **4 Categories**: Appetizers, Main Course, Desserts, Beverages
- **10 Menu Items**: Realistic restaurant items with prices
- **8 Tables**: Restaurant tables with QR codes
- **Admin User**: username `admin`, password `admin123`

### Sample Menu Items
| Item | Category | Price |
|------|----------|-------|
| Crispy Spring Rolls | Appetizers | $8.99 |
| Buffalo Chicken Wings | Appetizers | $12.99 |
| Grilled Atlantic Salmon | Main Course | $24.99 |
| Prime Ribeye Steak | Main Course | $34.99 |
| Thai Red Curry | Main Course | $18.99 |
| Molten Chocolate Cake | Desserts | $9.99 |

## 🛠️ Technical Details

### Database
- **File**: `database.sqlite` (auto-created)
- **Location**: Project root directory
- **Mode**: WAL (Write-Ahead Logging)
- **Foreign Keys**: Enabled

### API Endpoints (Unchanged)
- `GET/POST /api/tables` - Restaurant tables
- `GET/POST /api/categories` - Menu categories  
- `GET/POST /api/menu-items` - Menu items
- `GET/POST /api/addons` - Item add-ons
- `GET/POST /api/orders` - Order management
- `POST /api/admin/login` - Admin authentication
- `POST /api/seed` - Manual database seeding

### WebSocket Support
- Real-time order updates
- Admin notifications
- Table status changes

## 🔄 Database Management

### Reset Database
```bash
# Delete database file
rm database.sqlite
# Restart server - database will be recreated
npm run dev
```

### Manual Seeding
```bash
# Via API
curl -X POST http://localhost:5000/api/seed

# Via npm script
npm run db:seed
```

## 📁 File Structure
```
├── database.sqlite          # SQLite database (auto-created)
├── server/
│   ├── db.ts               # SQLite connection & schema
│   ├── seed.ts             # Database seeding
│   ├── storage.ts          # Data access layer
│   └── routes.ts           # API endpoints
├── shared/
│   └── schema.ts           # SQLite table definitions
├── client/                 # Frontend (unchanged)
└── drizzle.config.ts       # Drizzle SQLite config
```

## 🎯 Frontend Integration

The frontend requires **zero changes**:
- All API endpoints work identically
- Same request/response formats
- WebSocket connections preserved
- Authentication flow unchanged

## 🐛 Troubleshooting

### Server Won't Start
1. Check Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Try alternative start: `node start-server.js`

### Database Issues
1. Delete `database.sqlite`
2. Restart server
3. Database recreated automatically

### Empty Data
```bash
curl -X POST http://localhost:5000/api/seed
```

### Port Conflicts
Change port in `server/index.ts` if 5000 is occupied.

## 🔒 Admin Access

- **URL**: http://localhost:5000/admin/login
- **Username**: `admin`
- **Password**: `admin123`

## 📱 QR Code Testing

Each table has a QR code that links to:
```
http://localhost:5000/menu?table={tableNumber}&id={tableId}
```

## 🎉 Success Indicators

When everything works correctly:
- ✅ Server starts without errors
- ✅ Database file created automatically
- ✅ API endpoints return data
- ✅ Frontend loads menu items
- ✅ Orders can be placed
- ✅ Admin panel accessible

## 📞 Support

If you encounter issues:
1. Run `node verify-setup.js`
2. Check console for error messages
3. Verify all dependencies installed
4. Ensure no other services on port 5000

---

**🎊 Your Dine-Dash application is now running on SQLite!**