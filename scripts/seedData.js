import { collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../src/lib/firebase";

const categories = [
  { name: "Starters", icon: "appetizer" },
  { name: "Main Course", icon: "main" },
  { name: "Beverages", icon: "drink" },
  { name: "Desserts", icon: "dessert" }
];

const menuItems = [
  {
    name: "Crispy Paneer Tikka",
    description: "Marinated cottage cheese cubes grilled to perfection with bell peppers and onions.",
    price: 320,
    categoryName: "Starters",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    isVegetarian: true,
    spiceLevel: "medium",
    available: true,
    addons: [
      { name: "Extra Mint Chutney", price: 20 },
      { name: "Cheese Topping", price: 50 }
    ]
  },
  {
    name: "Butter Chicken",
    description: "Classic creamy tomato-based gravy with tender chicken pieces and aromatic spices.",
    price: 450,
    categoryName: "Main Course",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    isVegetarian: false,
    spiceLevel: "mild",
    available: true,
    addons: [
      { name: "Extra Butter", price: 30 },
      { name: "Garlic Naan", price: 60 }
    ]
  },
  {
    name: "Virgin Mojito",
    description: "Refreshing blend of fresh mint, lime, sugar, and sparkling soda.",
    price: 180,
    categoryName: "Beverages",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    isVegetarian: true,
    spiceLevel: "none",
    available: true,
    addons: [
      { name: "Extra Mint", price: 10 },
      { name: "Add Vodka Shot (Non-Veg choice)", price: 150 }
    ]
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten center, served with vanilla ice cream.",
    price: 250,
    categoryName: "Desserts",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80",
    isVegetarian: true,
    spiceLevel: "none",
    available: true,
    addons: [
      { name: "Extra Ice Cream Scoop", price: 80 },
      { name: "Chocolate Drizzle", price: 30 }
    ]
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils in a rich, creamy sauce - a north Indian favorite.",
    price: 280,
    categoryName: "Main Course",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    isVegetarian: true,
    spiceLevel: "mild",
    available: true,
    addons: [
      { name: "Extra Cream", price: 40 },
      { name: "Laccha Paratha", price: 50 }
    ]
  }
];

export async function seedDatabase(cafeId) {
  if (!cafeId) {
    throw new Error("cafeId is required for seeding");
  }

  try {
    console.log(`Starting database seeding for cafe: ${cafeId}...`);

    // 1. Clear existing categories and menu items for this cafe
    const catSnapshot = await getDocs(collection(db, "cafes", cafeId, "categories"));
    for (const doc of catSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    const itemSnapshot = await getDocs(collection(db, "cafes", cafeId, "menuItems"));
    for (const doc of itemSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Also clear tables
    const tableSnapshot = await getDocs(collection(db, "cafes", cafeId, "tables"));
    for (const doc of tableSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log("Cleared existing data for this cafe.");

    // 2. Add categories
    const categoryIds = {};
    for (const cat of categories) {
      const docRef = await addDoc(collection(db, "cafes", cafeId, "categories"), {
        name: cat.name,
        icon: cat.icon
      });
      categoryIds[cat.name] = docRef.id;
      console.log(`Added category: ${cat.name}`);
    }

    // 3. Add menu items
    for (const item of menuItems) {
      const categoryId = categoryIds[item.categoryName];
      const { categoryName, ...itemData } = item;
      await addDoc(collection(db, "cafes", cafeId, "menuItems"), {
        ...itemData,
        categoryId: categoryId
      });
      console.log(`Added menu item: ${item.name}`);
    }

    // 4. Add some default tables
    const defaultTables = [
      { tableNumber: 1, capacity: 2, status: "available" },
      { tableNumber: 2, capacity: 4, status: "available" },
      { tableNumber: 3, capacity: 4, status: "available" },
      { tableNumber: 4, capacity: 6, status: "available" },
      { tableNumber: 5, capacity: 2, status: "available" }
    ];

    for (const table of defaultTables) {
      await addDoc(collection(db, "cafes", cafeId, "tables"), table);
      console.log(`Added table: ${table.tableNumber}`);
    }

    console.log("Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
