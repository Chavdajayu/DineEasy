import { storage } from "./storage";
import { initializeDatabase } from "./db";

export async function seedDatabase() {
  // Initialize database schema
  await initializeDatabase();

  // Check if data already exists
  const existingCategories = await storage.getCategories();
  if (existingCategories.length > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database...");

  // Create categories
  const appetizers = await storage.createCategory({ 
    name: "Appetizers", 
    description: "Start your meal right", 
    sortOrder: 1, 
    isActive: true 
  });
  
  const mains = await storage.createCategory({ 
    name: "Main Course", 
    description: "Delicious main dishes", 
    sortOrder: 2, 
    isActive: true 
  });
  
  const desserts = await storage.createCategory({ 
    name: "Desserts", 
    description: "Sweet endings", 
    sortOrder: 3, 
    isActive: true 
  });
  
  const drinks = await storage.createCategory({ 
    name: "Beverages", 
    description: "Refreshing drinks", 
    sortOrder: 4, 
    isActive: true 
  });

  // Create menu items
  const springRolls = await storage.createMenuItem({
    categoryId: appetizers.id,
    name: "Crispy Spring Rolls",
    description: "Golden fried vegetable spring rolls served with sweet chili sauce",
    price: 8.99,
    isVegetarian: true,
    isSpicy: false,
    isAvailable: true,
    preparationTime: 10,
  });

  const chickenWings = await storage.createMenuItem({
    categoryId: appetizers.id,
    name: "Buffalo Chicken Wings",
    description: "Spicy chicken wings with blue cheese dip",
    price: 12.99,
    isVegetarian: false,
    isSpicy: true,
    isAvailable: true,
    preparationTime: 15,
  });

  const grilledSalmon = await storage.createMenuItem({
    categoryId: mains.id,
    name: "Grilled Atlantic Salmon",
    description: "Fresh salmon fillet with lemon butter sauce and seasonal vegetables",
    price: 24.99,
    isVegetarian: false,
    isSpicy: false,
    isAvailable: true,
    preparationTime: 25,
  });

  const veggiePasta = await storage.createMenuItem({
    categoryId: mains.id,
    name: "Garden Veggie Pasta",
    description: "Penne pasta with roasted vegetables in marinara sauce",
    price: 16.99,
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
    price: 34.99,
    isVegetarian: false,
    isSpicy: false,
    isAvailable: true,
    preparationTime: 30,
  });

  const spicyCurry = await storage.createMenuItem({
    categoryId: mains.id,
    name: "Thai Red Curry",
    description: "Authentic red curry with coconut milk, vegetables, and jasmine rice",
    price: 18.99,
    isVegetarian: true,
    isSpicy: true,
    isAvailable: true,
    preparationTime: 20,
  });

  const chocolateCake = await storage.createMenuItem({
    categoryId: desserts.id,
    name: "Molten Chocolate Cake",
    description: "Warm chocolate cake with a gooey center, served with vanilla ice cream",
    price: 9.99,
    isVegetarian: true,
    isSpicy: false,
    isAvailable: true,
    preparationTime: 12,
  });

  const tiramisu = await storage.createMenuItem({
    categoryId: desserts.id,
    name: "Classic Tiramisu",
    description: "Italian coffee-flavored dessert with mascarpone cream",
    price: 8.99,
    isVegetarian: true,
    isSpicy: false,
    isAvailable: true,
    preparationTime: 5,
  });

  await storage.createMenuItem({
    categoryId: drinks.id,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh mint",
    price: 4.99,
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
    price: 5.99,
    isVegetarian: true,
    isVegan: true,
    isSpicy: false,
    isAvailable: true,
    preparationTime: 2,
  });

  // Create addons
  await storage.createAddon({ menuItemId: springRolls.id, name: "Extra Sauce", price: 1.00, isAvailable: true });
  await storage.createAddon({ menuItemId: chickenWings.id, name: "Extra Blue Cheese", price: 1.50, isAvailable: true });
  await storage.createAddon({ menuItemId: chickenWings.id, name: "Ranch Dip", price: 1.50, isAvailable: true });
  await storage.createAddon({ menuItemId: grilledSalmon.id, name: "Extra Vegetables", price: 3.00, isAvailable: true });
  await storage.createAddon({ menuItemId: steakRibeye.id, name: "Mushroom Sauce", price: 2.50, isAvailable: true });
  await storage.createAddon({ menuItemId: steakRibeye.id, name: "Peppercorn Sauce", price: 2.50, isAvailable: true });
  await storage.createAddon({ menuItemId: spicyCurry.id, name: "Extra Rice", price: 2.00, isAvailable: true });
  await storage.createAddon({ menuItemId: chocolateCake.id, name: "Extra Ice Cream", price: 2.00, isAvailable: true });

  // Create sample tables
  for (let i = 1; i <= 8; i++) {
    await storage.createTable({ 
      tableNumber: i, 
      capacity: i <= 4 ? 4 : 6, 
      status: "available" 
    });
  }

  console.log("Database seeded successfully!");
}