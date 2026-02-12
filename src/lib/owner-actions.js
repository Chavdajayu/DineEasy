import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Firebase config for secondary app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * Creates a new cafe and its admin user.
 * Uses a secondary Firebase app instance to avoid logging out the current owner.
 */
export const createCafeWithAdmin = async (cafeName, adminEmail, adminPassword, ownerUid) => {
  const secondaryAppName = `secondary-app-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // 1. Create the admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, adminEmail, adminPassword);
    const adminUid = userCredential.user.uid;

    // 2. Generate slug
    const slug = cafeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 3. Create cafe document in Firestore
    const cafeData = {
      name: cafeName,
      slug: slug,
      adminUid: adminUid,
      adminEmail: adminEmail,
      active: true,
      createdAt: serverTimestamp(),
      createdByOwnerId: ownerUid
    };

    const docRef = await addDoc(collection(db, "cafes"), cafeData);

    // 4. Sign out of the secondary app
    await signOut(secondaryAuth);
    
    return { id: docRef.id, ...cafeData };
  } catch (error) {
    console.error("Error creating cafe with admin:", error);
    throw error;
  }
};

/**
 * Creates a new owner user.
 */
export const createNewOwner = async (username, ownerEmail, ownerPassword) => {
  const secondaryAppName = `owner-app-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // 1. Create the owner user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, ownerEmail, ownerPassword);
    const ownerUid = userCredential.user.uid;

    // 2. Add to owners collection using UID as document ID
    const ownerData = {
      username: username,
      email: ownerEmail,
      active: true,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "owners", ownerUid), ownerData);

    // 3. Cleanup
    await signOut(secondaryAuth);
    
    return ownerData;
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
};
