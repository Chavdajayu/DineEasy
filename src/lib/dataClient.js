const STORAGE_KEYS = {
  categories: "dd_categories",
  menuItems: "dd_menuItems",
  addons: "dd_addons",
  tables: "dd_tables",
  orders: "dd_orders",
  adminUsers: "dd_adminUsers",
};

async function seedFromJson(key, url) {
  const existing = localStorage.getItem(key);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      localStorage.removeItem(key);
    }
  }
  const res = await fetch(url);
  const data = await res.json();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

export async function initSeeds() {
  // Seed only once per key if not present
  await Promise.all([
    seedFromJson(STORAGE_KEYS.categories, "/data/categories.json"),
    seedFromJson(STORAGE_KEYS.menuItems, "/data/menu-items.json"),
    seedFromJson(STORAGE_KEYS.addons, "/data/addons.json"),
    seedFromJson(STORAGE_KEYS.tables, "/data/tables.json"),
    seedFromJson(STORAGE_KEYS.orders, "/data/orders.json"),
    seedFromJson(STORAGE_KEYS.adminUsers, "/data/admin-users.json"),
  ]);
}

function read(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Queries
export async function fetchCategories() {
  return read(STORAGE_KEYS.categories).filter((c) => c.isActive);
}
export async function fetchMenuItems() {
  return read(STORAGE_KEYS.menuItems);
}
export async function fetchAddons() {
  return read(STORAGE_KEYS.addons);
}
export async function fetchTables() {
  return read(STORAGE_KEYS.tables);
}
export async function fetchOrders() {
  return read(STORAGE_KEYS.orders);
}
export async function fetchOrdersBySession(sessionId) {
  return read(STORAGE_KEYS.orders).filter((o) => o.sessionId === sessionId);
}

// Admin auth
export async function login(username, password) {
  const users = read(STORAGE_KEYS.adminUsers);
  const match = users.find((u) => u.username === username && u.password === password);
  if (!match) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }
  return { id: match.id, name: match.name, role: match.role };
}

// Tables mutations
export async function createTable({ tableNumber, capacity }) {
  const tables = read(STORAGE_KEYS.tables);
  const existsNum = tables.some((t) => t.tableNumber === tableNumber);
  if (existsNum) {
    throw new Error("Table number already exists");
  }
  const id = `tbl_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
  const newTable = {
    id,
    tableNumber,
    capacity,
    status: "available",
    qrCode: null,
    sessionId: null,
  };
  tables.push(newTable);
  write(STORAGE_KEYS.tables, tables);
  return newTable;
}

export async function deleteTable(tableId) {
  const tables = read(STORAGE_KEYS.tables).filter((t) => t.id !== tableId);
  write(STORAGE_KEYS.tables, tables);
  return { ok: true };
}

// Orders mutations
export async function createOrder(orderData) {
  const orders = read(STORAGE_KEYS.orders);
  const id = `ord_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
  const now = new Date().toISOString();
  const order = {
    id,
    status: "received",
    paymentStatus: "pending",
    createdAt: now,
    updatedAt: now,
    ...orderData,
    items: orderData.items.map((i) => ({
      id: `item_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
      orderId: id,
      ...i,
    })),
  };
  orders.unshift(order);
  write(STORAGE_KEYS.orders, orders);
  return order;
}

export async function updateOrderStatus(orderId, status) {
  const orders = read(STORAGE_KEYS.orders);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error("Order not found");
  orders[idx] = {
    ...orders[idx],
    status,
    updatedAt: new Date().toISOString(),
    paymentStatus: status === "served" ? "paid" : orders[idx].paymentStatus,
  };
  write(STORAGE_KEYS.orders, orders);
  return orders[idx];
}

