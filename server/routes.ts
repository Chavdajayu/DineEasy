import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTableSchema, insertCategorySchema, insertMenuItemSchema, insertAddonSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import QRCode from "qrcode";
import { z } from "zod";

// WebSocket clients map
const wsClients = new Map<string, Set<WebSocket>>();
const adminClients = new Set<WebSocket>();

function broadcastToSession(sessionId: string, message: object) {
  const clients = wsClients.get(sessionId);
  if (clients) {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

function broadcastToAdmin(message: object) {
  const data = JSON.stringify(message);
  adminClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    let subscribedSessionId: string | null = null;
    let isAdminSubscription = false;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "subscribe" && data.sessionId) {
          subscribedSessionId = data.sessionId;
          if (!wsClients.has(subscribedSessionId)) {
            wsClients.set(subscribedSessionId, new Set());
          }
          wsClients.get(subscribedSessionId)!.add(ws);
        }

        if (data.type === "subscribeAdmin") {
          isAdminSubscription = true;
          adminClients.add(ws);
        }
      } catch (e) {
        console.error("WebSocket message parse error:", e);
      }
    });

    ws.on("close", () => {
      if (subscribedSessionId) {
        const clients = wsClients.get(subscribedSessionId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            wsClients.delete(subscribedSessionId);
          }
        }
      }
      if (isAdminSubscription) {
        adminClients.delete(ws);
      }
    });
  });

  // ============ Admin Auth Routes ============
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      let user = await storage.getAdminUserByUsername(username);

      // Create default admin if not exists
      if (!user && username === "admin" && password === "admin123") {
        user = await storage.createAdminUser({
          username: "admin",
          password: "admin123", // In production, hash this!
          name: "Admin User",
          role: "admin",
        });
      }

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ============ Tables Routes ============
  app.get("/api/tables", async (_req, res) => {
    try {
      const allTables = await storage.getTables();
      res.json(allTables);
    } catch (error) {
      console.error("Get tables error:", error);
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.get("/api/tables/:id", async (req, res) => {
    try {
      const table = await storage.getTable(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      console.error("Get table error:", error);
      res.status(500).json({ message: "Failed to fetch table" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const validated = insertTableSchema.parse(req.body);

      // Check if table number already exists
      const existing = await storage.getTableByNumber(validated.tableNumber);
      if (existing) {
        return res.status(400).json({ message: "Table number already exists" });
      }

      const table = await storage.createTable(validated);

      // Generate QR code
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const tableUrl = `${baseUrl}/menu?table=${table.tableNumber}&id=${table.id}`;
      const qrCode = await QRCode.toDataURL(tableUrl, {
        width: 400,
        margin: 2,
        color: { dark: "#1A1A1A", light: "#FFFFFF" },
      });

      const updatedTable = await storage.updateTable(table.id, { qrCode });

      res.status(201).json(updatedTable);
    } catch (error) {
      console.error("Create table error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid table data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create table" });
    }
  });

  app.delete("/api/tables/:id", async (req, res) => {
    try {
      await storage.deleteTable(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete table error:", error);
      res.status(500).json({ message: "Failed to delete table" });
    }
  });

  // ============ Categories Routes ============
  app.get("/api/categories", async (_req, res) => {
    try {
      const allCategories = await storage.getCategories();
      res.json(allCategories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // ============ Menu Items Routes ============
  app.get("/api/menu-items", async (_req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      console.error("Get menu items error:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Get menu item error:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const validated = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create menu item error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  // ============ Addons Routes ============
  app.get("/api/addons", async (_req, res) => {
    try {
      const allAddons = await storage.getAddons();
      res.json(allAddons);
    } catch (error) {
      console.error("Get addons error:", error);
      res.status(500).json({ message: "Failed to fetch addons" });
    }
  });

  app.post("/api/addons", async (req, res) => {
    try {
      const validated = insertAddonSchema.parse(req.body);
      const addon = await storage.createAddon(validated);
      res.status(201).json(addon);
    } catch (error) {
      console.error("Create addon error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid addon data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create addon" });
    }
  });

  // ============ Orders Routes ============
  app.get("/api/orders", async (_req, res) => {
    try {
      const allOrders = await storage.getOrders();
      
      // Get items for each order
      const ordersWithItems = await Promise.all(
        allOrders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );

      res.json(ordersWithItems);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/session/:sessionId", async (req, res) => {
    try {
      const sessionOrders = await storage.getOrdersBySession(req.params.sessionId);
      
      const ordersWithItems = await Promise.all(
        sessionOrders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );

      res.json(ordersWithItems);
    } catch (error) {
      console.error("Get session orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;

      // Validate order data
      const validatedOrder = insertOrderSchema.parse(orderData);

      // Create the order
      const order = await storage.createOrder(validatedOrder);

      // Create order items
      const orderItems = await Promise.all(
        items.map((item: any) => {
          const validatedItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id,
          });
          return storage.createOrderItem(validatedItem);
        })
      );

      // Update table status to occupied
      await storage.updateTable(order.tableId, { status: "occupied", sessionId: order.sessionId });

      const orderWithItems = { ...order, items: orderItems };

      // Broadcast to admin
      broadcastToAdmin({ type: "newOrder", order: orderWithItems });
      
      // Broadcast to session
      broadcastToSession(order.sessionId, { type: "orderUpdate", order: orderWithItems });

      res.status(201).json(orderWithItems);
    } catch (error) {
      console.error("Create order error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(order.id);
      const orderWithItems = { ...order, items };

      // If order is served, update table status
      if (status === "served") {
        const tableOrders = await storage.getOrdersByTable(order.tableId);
        const activeOrders = tableOrders.filter((o) => !["served", "cancelled"].includes(o.status));
        if (activeOrders.length === 0) {
          await storage.updateTable(order.tableId, { status: "available", sessionId: null });
        }
      }

      // Broadcast updates
      broadcastToAdmin({ type: "orderUpdate", order: orderWithItems });
      broadcastToSession(order.sessionId, { type: "orderUpdate", order: orderWithItems });

      res.json(orderWithItems);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.patch("/api/orders/:id/payment", async (req, res) => {
    try {
      const { paymentStatus, paymentMethod, stripePaymentIntentId } = req.body;

      const order = await storage.updateOrderPayment(
        req.params.id,
        paymentStatus,
        paymentMethod,
        stripePaymentIntentId
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(order.id);
      const orderWithItems = { ...order, items };

      broadcastToAdmin({ type: "orderUpdate", order: orderWithItems });
      broadcastToSession(order.sessionId, { type: "orderUpdate", order: orderWithItems });

      res.json(orderWithItems);
    } catch (error) {
      console.error("Update order payment error:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // ============ Seed Data Route ============
  app.post("/api/seed", async (_req, res) => {
    try {
      // Check if data already exists
      const existingCategories = await storage.getCategories();
      if (existingCategories.length > 0) {
        return res.json({ message: "Data already seeded" });
      }

      // Create categories
      const appetizers = await storage.createCategory({ name: "Appetizers", description: "Start your meal right", sortOrder: 1, isActive: true });
      const mains = await storage.createCategory({ name: "Main Course", description: "Delicious main dishes", sortOrder: 2, isActive: true });
      const desserts = await storage.createCategory({ name: "Desserts", description: "Sweet endings", sortOrder: 3, isActive: true });
      const drinks = await storage.createCategory({ name: "Beverages", description: "Refreshing drinks", sortOrder: 4, isActive: true });

      // Create menu items
      const springRolls = await storage.createMenuItem({
        categoryId: appetizers.id,
        name: "Crispy Spring Rolls",
        description: "Golden fried vegetable spring rolls served with sweet chili sauce",
        price: "8.99",
        isVegetarian: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 10,
      });

      const chickenWings = await storage.createMenuItem({
        categoryId: appetizers.id,
        name: "Buffalo Chicken Wings",
        description: "Spicy chicken wings with blue cheese dip",
        price: "12.99",
        isVegetarian: false,
        isSpicy: true,
        isAvailable: true,
        preparationTime: 15,
      });

      const grilledSalmon = await storage.createMenuItem({
        categoryId: mains.id,
        name: "Grilled Atlantic Salmon",
        description: "Fresh salmon fillet with lemon butter sauce and seasonal vegetables",
        price: "24.99",
        isVegetarian: false,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 25,
      });

      const veggiePasta = await storage.createMenuItem({
        categoryId: mains.id,
        name: "Garden Veggie Pasta",
        description: "Penne pasta with roasted vegetables in marinara sauce",
        price: "16.99",
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 18,
      });

      const steakRibeye = await storage.createMenuItem({
        categoryId: mains.id,
        name: "Prime Ribeye Steak",
        description: "12oz ribeye cooked to perfection with garlic mashed potatoes",
        price: "34.99",
        isVegetarian: false,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 30,
      });

      const spicyCurry = await storage.createMenuItem({
        categoryId: mains.id,
        name: "Thai Red Curry",
        description: "Authentic red curry with coconut milk, vegetables, and jasmine rice",
        price: "18.99",
        isVegetarian: true,
        isSpicy: true,
        isAvailable: true,
        preparationTime: 20,
      });

      const chocolateCake = await storage.createMenuItem({
        categoryId: desserts.id,
        name: "Molten Chocolate Cake",
        description: "Warm chocolate cake with a gooey center, served with vanilla ice cream",
        price: "9.99",
        isVegetarian: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 12,
      });

      const tiramisu = await storage.createMenuItem({
        categoryId: desserts.id,
        name: "Classic Tiramisu",
        description: "Italian coffee-flavored dessert with mascarpone cream",
        price: "8.99",
        isVegetarian: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 5,
      });

      await storage.createMenuItem({
        categoryId: drinks.id,
        name: "Fresh Lemonade",
        description: "House-made lemonade with fresh mint",
        price: "4.99",
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 3,
      });

      await storage.createMenuItem({
        categoryId: drinks.id,
        name: "Iced Coffee",
        description: "Cold brewed coffee served over ice",
        price: "5.99",
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 2,
      });

      // Create addons
      await storage.createAddon({ menuItemId: springRolls.id, name: "Extra Sauce", price: "1.00", isAvailable: true });
      await storage.createAddon({ menuItemId: chickenWings.id, name: "Extra Blue Cheese", price: "1.50", isAvailable: true });
      await storage.createAddon({ menuItemId: chickenWings.id, name: "Ranch Dip", price: "1.50", isAvailable: true });
      await storage.createAddon({ menuItemId: grilledSalmon.id, name: "Extra Vegetables", price: "3.00", isAvailable: true });
      await storage.createAddon({ menuItemId: steakRibeye.id, name: "Mushroom Sauce", price: "2.50", isAvailable: true });
      await storage.createAddon({ menuItemId: steakRibeye.id, name: "Peppercorn Sauce", price: "2.50", isAvailable: true });
      await storage.createAddon({ menuItemId: spicyCurry.id, name: "Extra Rice", price: "2.00", isAvailable: true });
      await storage.createAddon({ menuItemId: chocolateCake.id, name: "Extra Ice Cream", price: "2.00", isAvailable: true });

      // Create sample tables
      for (let i = 1; i <= 8; i++) {
        const table = await storage.createTable({ tableNumber: i, capacity: i <= 4 ? 4 : 6, status: "available" });
        const baseUrl = `${_req.protocol}://${_req.get("host")}`;
        const tableUrl = `${baseUrl}/menu?table=${table.tableNumber}&id=${table.id}`;
        const qrCode = await QRCode.toDataURL(tableUrl, {
          width: 400,
          margin: 2,
          color: { dark: "#1A1A1A", light: "#FFFFFF" },
        });
        await storage.updateTable(table.id, { qrCode });
      }

      res.json({ message: "Seed data created successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  return httpServer;
}
