import {
  adminUsers, tables, categories, menuItems, addons, orders, orderItems,
  type AdminUser, type InsertAdminUser,
  type Table, type InsertTable,
  type Category, type InsertCategory,
  type MenuItem, type InsertMenuItem,
  type Addon, type InsertAddon,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
} from "@shared/schema";
import { getDb } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;

  // Tables
  getTables(): Promise<Table[]>;
  getTable(id: string): Promise<Table | undefined>;
  getTableByNumber(tableNumber: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined>;
  deleteTable(id: string): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;

  // Addons
  getAddons(): Promise<Addon[]>;
  getAddonsByMenuItem(menuItemId: string): Promise<Addon[]>;
  createAddon(addon: InsertAddon): Promise<Addon>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersBySession(sessionId: string): Promise<Order[]>;
  getOrdersByTable(tableId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateOrderPayment(id: string, paymentStatus: string, paymentMethod?: string, stripePaymentIntentId?: string): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const db = await getDb();
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const db = await getDb();
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const db = await getDb();
    const [user] = await db.insert(adminUsers).values(insertUser).returning();
    return user;
  }

  // Tables
  async getTables(): Promise<Table[]> {
    const db = await getDb();
    return db.select().from(tables).orderBy(tables.tableNumber);
  }

  async getTable(id: string): Promise<Table | undefined> {
    const db = await getDb();
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table || undefined;
  }

  async getTableByNumber(tableNumber: number): Promise<Table | undefined> {
    const db = await getDb();
    const [table] = await db.select().from(tables).where(eq(tables.tableNumber, tableNumber));
    return table || undefined;
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const db = await getDb();
    const [table] = await db.insert(tables).values(insertTable).returning();
    return table;
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined> {
    const db = await getDb();
    const [table] = await db.update(tables).set(updates).where(eq(tables.id, id)).returning();
    return table || undefined;
  }

  async deleteTable(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(tables).where(eq(tables.id, id));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const db = await getDb();
    return db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const db = await getDb();
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const db = await getDb();
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    const db = await getDb();
    return db.select().from(menuItems);
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const db = await getDb();
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    const db = await getDb();
    return db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId));
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const db = await getDb();
    const [item] = await db.insert(menuItems).values(insertItem).returning();
    return item;
  }

  // Addons
  async getAddons(): Promise<Addon[]> {
    const db = await getDb();
    return db.select().from(addons);
  }

  async getAddonsByMenuItem(menuItemId: string): Promise<Addon[]> {
    const db = await getDb();
    return db.select().from(addons).where(eq(addons.menuItemId, menuItemId));
  }

  async createAddon(insertAddon: InsertAddon): Promise<Addon> {
    const db = await getDb();
    const [addon] = await db.insert(addons).values(insertAddon).returning();
    return addon;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const db = await getDb();
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersBySession(sessionId: string): Promise<Order[]> {
    const db = await getDb();
    return db.select().from(orders).where(eq(orders.sessionId, sessionId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const db = await getDb();
    return db.select().from(orders).where(eq(orders.tableId, tableId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const db = await getDb();
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const db = await getDb();
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateOrderPayment(
    id: string,
    paymentStatus: string,
    paymentMethod?: string,
    stripePaymentIntentId?: string
  ): Promise<Order | undefined> {
    const db = await getDb();
    const updates: Partial<Order> = { paymentStatus, updatedAt: new Date().toISOString() };
    if (paymentMethod) updates.paymentMethod = paymentMethod;
    if (stripePaymentIntentId) updates.stripePaymentIntentId = stripePaymentIntentId;

    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const db = await getDb();
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const db = await getDb();
    const [item] = await db.insert(orderItems).values(insertItem).returning();
    return item;
  }
}

export const storage = new DatabaseStorage();

// For backward compatibility
export type User = AdminUser;
export type InsertUser = InsertAdminUser;
