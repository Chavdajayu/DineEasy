import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useTables = (cafeId) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cafeId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "cafes", cafeId, "tables"),
      (snapshot) => {
        const tablesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTables(tablesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tables:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [cafeId]);

  const addTable = async (tableData) => {
    if (!cafeId) return;
    try {
      await addDoc(collection(db, "cafes", cafeId, "tables"), {
        ...tableData,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error adding table:", err);
      throw err;
    }
  };

  const removeTable = async (tableId) => {
    if (!cafeId) return;
    try {
      await deleteDoc(doc(db, "cafes", cafeId, "tables", tableId));
    } catch (err) {
      console.error("Error removing table:", err);
      throw err;
    }
  };

  return { tables, loading, error, addTable, removeTable };
};
