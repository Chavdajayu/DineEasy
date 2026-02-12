
const STORAGE_KEYS = {
  CATEGORIES: 'de_categories',
  MENU_ITEMS: 'de_menu_items',
  ADDONS: 'de_addons',
  TABLES: 'de_tables',
  ORDERS: 'de_orders',
  ADMIN_USER: 'de_admin_user',
  SESSION: 'de_session',
  CART: 'de_cart'
};

const INITIAL_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

// Generic read/write
const read = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const write = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Seed initial data from public JSON files if localStorage is empty
export const initStorage = async () => {
  const seedData = async (key, path) => {
    if (!localStorage.getItem(key)) {
      try {
        const response = await fetch(path);
        const data = await response.json();
        write(key, data);
      } catch (error) {
        console.error(`Error seeding ${key}:`, error);
      }
    }
  };

  await Promise.all([
    seedData(STORAGE_KEYS.CATEGORIES, '/data/categories.json'),
    seedData(STORAGE_KEYS.MENU_ITEMS, '/data/menu-items.json'),
    seedData(STORAGE_KEYS.ADDONS, '/data/addons.json'),
    seedData(STORAGE_KEYS.TABLES, '/data/tables.json'),
  ]);

  if (!read(STORAGE_KEYS.ADMIN_USER)) {
    write(STORAGE_KEYS.ADMIN_USER, INITIAL_ADMIN);
  }

  if (!read(STORAGE_KEYS.ORDERS)) {
    write(STORAGE_KEYS.ORDERS, []);
  }
};

// Orders
export const getOrders = () => read(STORAGE_KEYS.ORDERS) || [];
export const saveOrder = (order) => {
  const orders = getOrders();
  const newOrder = {
    ...order,
    id: `ord_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  write(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
  return newOrder;
};

export const updateOrderStatus = (orderId, status) => {
  const orders = getOrders();
  const updatedOrders = orders.map(order => 
    order.id === orderId ? { ...order, status } : order
  );
  write(STORAGE_KEYS.ORDERS, updatedOrders);
  return updatedOrders.find(o => o.id === orderId);
};

// Tables
export const getTables = () => read(STORAGE_KEYS.TABLES) || [];
export const saveTables = (tables) => write(STORAGE_KEYS.TABLES, tables);
export const addTable = (table) => {
  const tables = getTables();
  const newTable = {
    ...table,
    id: `tbl_${Date.now()}`,
    status: 'available'
  };
  write(STORAGE_KEYS.TABLES, [...tables, newTable]);
  return newTable;
};
export const deleteTable = (id) => {
  const tables = getTables();
  write(STORAGE_KEYS.TABLES, tables.filter(t => t.id !== id));
};

// Cart
export const getCart = (tableId) => {
  const carts = read(STORAGE_KEYS.CART) || {};
  return carts[tableId] || [];
};
export const saveCart = (tableId, items) => {
  const carts = read(STORAGE_KEYS.CART) || {};
  carts[tableId] = items;
  write(STORAGE_KEYS.CART, carts);
};
export const clearCart = (tableId) => {
  const carts = read(STORAGE_KEYS.CART) || {};
  delete carts[tableId];
  write(STORAGE_KEYS.CART, carts);
};

// Menu
export const getCategories = () => read(STORAGE_KEYS.CATEGORIES) || [];
export const getMenuItems = () => read(STORAGE_KEYS.MENU_ITEMS) || [];
export const getAddons = () => read(STORAGE_KEYS.ADDONS) || [];

// Auth
export const getAdminUser = () => read(STORAGE_KEYS.ADMIN_USER);
export const setAdminSession = (isAdmin) => {
  write(STORAGE_KEYS.SESSION, { isAdmin, timestamp: Date.now() });
};
export const getAdminSession = () => {
  const session = read(STORAGE_KEYS.SESSION);
  if (!session) return null;
  // Session expires after 24 hours
  if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return null;
  }
  return session;
};
export const clearAdminSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};
