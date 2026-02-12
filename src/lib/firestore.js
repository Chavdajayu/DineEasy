import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

// --- Cafe Actions ---
export const updateCafeAdminUid = async (cafeId, adminUid) => {
  const cafeRef = doc(db, "cafes", cafeId);
  await updateDoc(cafeRef, { adminUid });
};

// --- Table Sessions ---
export const getOrCreateSession = async (cafeId, tableNumber, tableId) => {
  if (!cafeId || !tableNumber || !tableId) return null;

  const sessionsRef = collection(db, "cafes", cafeId, "tableSessions");
  const q = query(
    sessionsRef, 
    where("tableId", "==", tableId), 
    where("active", "==", true)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return docs[0];
  }

  const newSession = {
    tableNumber: parseInt(tableNumber),
    tableId,
    createdAt: serverTimestamp(),
    active: true
  };
  
  const docRef = await addDoc(sessionsRef, newSession);
  return { id: docRef.id, ...newSession };
};

// --- Menu ---
export const getCategories = async (cafeId) => {
  if (!cafeId) return [];
  const snapshot = await getDocs(collection(db, "cafes", cafeId, "categories"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMenuItems = async (cafeId, categoryId = null) => {
  if (!cafeId) return [];
  const itemsRef = collection(db, "cafes", cafeId, "menuItems");
  const q = categoryId 
    ? query(itemsRef, where("categoryId", "==", categoryId))
    : itemsRef;
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Orders ---
export const placeOrder = async (cafeId, orderData) => {
  if (!cafeId) throw new Error("Cafe ID is required");
  const ordersRef = collection(db, "cafes", cafeId, "orders");
  const newOrder = {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(ordersRef, newOrder);
  return { id: docRef.id, ...newOrder };
};

export const updateOrderStatus = async (cafeId, orderId, status) => {
  if (!cafeId) throw new Error("Cafe ID is required");
  const orderRef = doc(db, "cafes", cafeId, "orders", orderId);
  await updateDoc(orderRef, { status });
};

// --- Tables ---
export const getAllTables = async (cafeId) => {
  if (!cafeId) return [];
  const snapshot = await getDocs(collection(db, "cafes", cafeId, "tables"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createTable = async (cafeId, tableData) => {
  if (!cafeId) throw new Error("Cafe ID is required");
  const docRef = await addDoc(collection(db, "cafes", cafeId, "tables"), {
    ...tableData,
    status: "available",
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...tableData };
};

// --- Owners & Cafes ---
export const getOwnerByEmail = async (email) => {
  const q = query(collection(db, "owners"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const createOwner = async (ownerUid, ownerData) => {
  await setDoc(doc(db, "owners", ownerUid), {
    ...ownerData,
    active: true,
    createdAt: serverTimestamp()
  });
  return { id: ownerUid, ...ownerData };
};

export const getAllCafes = async () => {
  const snapshot = await getDocs(collection(db, "cafes"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCafesByOwner = async (ownerUid) => {
  const q = query(collection(db, "cafes"), where("createdByOwnerId", "==", ownerUid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCafe = async (cafeData) => {
  const docRef = await addDoc(collection(db, "cafes"), {
    ...cafeData,
    active: true,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...cafeData };
};

export const updateCafeStatus = async (cafeId, active) => {
  const cafeRef = doc(db, "cafes", cafeId);
  await updateDoc(cafeRef, { active });
};

export const getCafeByAdminUid = async (adminUid) => {
  const q = query(collection(db, "cafes"), where("adminUid", "==", adminUid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};
