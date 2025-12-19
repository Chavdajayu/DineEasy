import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  serverTimestamp 
} from "firebase/firestore";

const STORAGE_KEYS = {
  categories: "dd_categories",
  menuItems: "dd_menuItems",
  addons: "dd_addons",
  tables: "dd_tables",
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

// Real-time Subscriptions
export function subscribeToOrders(callback) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
    }));
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to orders:", error);
  });
}

export function subscribeToOrdersBySession(sessionId, callback) {
  const q = query(
    collection(db, "orders"), 
    where("sessionId", "==", sessionId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
    }));
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to session orders:", error);
  });
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
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "received",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      items: orderData.items.map((i) => ({
        ...i,
        id: i.id || `item_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      })),
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const orderRef = doc(db, "orders", orderId);
    const updates = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (status === "served") {
      updates.paymentStatus = "paid";
    }
    await updateDoc(orderRef, updates);
    return { id: orderId, ...updates };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

