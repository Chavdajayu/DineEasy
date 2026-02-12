import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useOrders = (cafeId, sessionId = null) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cafeId) {
      setLoading(false);
      return;
    }

    let q;
    const ordersRef = collection(db, "cafes", cafeId, "orders");
    
    if (sessionId) {
      q = query(ordersRef, where("sessionId", "==", sessionId));
    } else {
      q = query(ordersRef, orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        // Sort in memory if we were filtering by sessionId
        if (sessionId) {
          ordersData.sort((a, b) => b.createdAt - a.createdAt);
        }
        
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const updateStatus = async (orderId, status) => {
    try {
      if (!cafeId) throw new Error("Cafe ID is required to update order status");
      const orderRef = doc(db, "cafes", cafeId, "orders", orderId);
      await updateDoc(orderRef, { status });
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    }
  };

  return { orders, loading, error, updateStatus };
};
