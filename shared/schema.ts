import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { randomUUID } from "crypto";

// Admin users for restaurant staff
export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
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
export const tables = sqliteTable("tables", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  tableNumber: integer("table_number").notNull().unique(),
  capacity: integer("capacity").notNull().default(4),
  status: text("status").notNull().default("available"), // available, occupied, reserved
  qrCode: text("qr_code"),
  sessionId: text("session_id"),
});

export const insertTableSchema = createInsertSchema(tables).pick({
  tableNumber: true,
  capacity: true,
  status: true,
});

export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

// Menu categories
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
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
export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  categoryId: text("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  image: text("image"),
  isVegetarian: integer("is_vegetarian", { mode: "boolean" }).notNull().default(false),
  isVegan: integer("is_vegan", { mode: "boolean" }).notNull().default(false),
  isSpicy: integer("is_spicy", { mode: "boolean" }).notNull().default(false),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
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
export const addons = sqliteTable("addons", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  menuItemId: text("menu_item_id").notNull().references(() => menuItems.id),
  name: text("name").notNull(),
  price: real("price").notNull(),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
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
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  tableId: text("table_id").notNull().references(() => tables.id),
  tableNumber: integer("table_number").notNull(),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("received"),
  subtotal: real("subtotal").notNull(),
  tax: real("tax").notNull(),
  total: real("total").notNull(),
  specialInstructions: text("special_instructions"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
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
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id),
  menuItemId: text("menu_item_id").notNull().references(() => menuItems.id),
  menuItemName: text("menu_item_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  spiceLevel: integer("spice_level").default(0), // 0-4
  selectedAddons: text("selected_addons", { mode: "json" }).$type<{ id: string; name: string; price: string }[]>(),
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
