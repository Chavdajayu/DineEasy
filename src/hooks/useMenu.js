import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useMenu = (cafeId) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cafeId) {
      setLoading(false);
      return;
    }

    // Listen to categories
    const unsubCategories = onSnapshot(
      query(collection(db, "cafes", cafeId, "categories"), orderBy("name")),
      (snapshot) => {
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    // Listen to menu items
    const unsubItems = onSnapshot(
      query(collection(db, "cafes", cafeId, "menuItems"), orderBy("name")),
      (snapshot) => {
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching menu:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubCategories();
      unsubItems();
    };
  }, [cafeId]);

  return { items, categories, loading, error };
};
