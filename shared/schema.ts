import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users for restaurant staff
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("staff"),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Restaurant tables
export const tables = pgTable("tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableNumber: integer("table_number").notNull().unique(),
  capacity: integer("capacity").notNull().default(4),
  status: text("status").notNull().default("available"), // available, occupied, reserved
  qrCode: text("qr_code"),
  sessionId: varchar("session_id"),
});

export const insertTableSchema = createInsertSchema(tables).pick({
  tableNumber: true,
  capacity: true,
  status: true,
});

export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

// Menu categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Menu items
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isVegan: boolean("is_vegan").notNull().default(false),
  isSpicy: boolean("is_spicy").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  preparationTime: integer("preparation_time").default(15), // in minutes
  calories: integer("calories"),
});

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  addons: many(addons),
}));

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  categoryId: true,
  name: true,
  description: true,
  price: true,
  image: true,
  isVegetarian: true,
  isVegan: true,
  isSpicy: true,
  isAvailable: true,
  preparationTime: true,
  calories: true,
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// Add-ons for menu items
export const addons = pgTable("addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const addonsRelations = relations(addons, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [addons.menuItemId],
    references: [menuItems.id],
  }),
}));

export const insertAddonSchema = createInsertSchema(addons).pick({
  menuItemId: true,
  name: true,
  price: true,
  isAvailable: true,
});

export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;

// Order status enum
export const orderStatuses = ["received", "preparing", "cooking", "ready", "served", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: varchar("table_id").notNull().references(() => tables.id),
  tableNumber: integer("table_number").notNull(),
  sessionId: varchar("session_id").notNull(),
  status: text("status").notNull().default("received"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text("special_instructions"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
  items: many(orderItems),
}));

export const insertOrderSchema = createInsertSchema(orders).pick({
  tableId: true,
  tableNumber: true,
  sessionId: true,
  subtotal: true,
  tax: true,
  total: true,
  specialInstructions: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id),
  menuItemName: text("menu_item_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  spiceLevel: integer("spice_level").default(0), // 0-4
  selectedAddons: jsonb("selected_addons").$type<{ id: string; name: string; price: string }[]>(),
  specialInstructions: text("special_instructions"),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  menuItemId: true,
  menuItemName: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
  spiceLevel: true,
  selectedAddons: true,
  specialInstructions: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Cart item type for frontend
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  spiceLevel: number;
  selectedAddons: Addon[];
  specialInstructions: string;
  totalPrice: number;
}

// For backward compatibility
export const users = adminUsers;
export const insertUserSchema = insertAdminUserSchema;
export type InsertUser = InsertAdminUser;
export type User = AdminUser;
