import { createContext, useContext, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const CafeContext = createContext(undefined);

export const CafeProvider = ({ children }) => {
  const { cafeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cafeData, setCafeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCafe = async () => {
      if (!cafeSlug) {
        setLoading(false);
        return;
      }

      try {
        // Only set loading if we don't have any cafe data or if the slug changed
        if (!cafeData || cafeData.slug !== cafeSlug) {
          setLoading(true);
        }

        const cafesRef = collection(db, "cafes");
        const q = query(cafesRef, where("slug", "==", cafeSlug), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Cafe not found");
          setCafeData(null);
        } else {
          const doc = querySnapshot.docs[0];
          const data = { id: doc.id, ...doc.data() };
          
          if (!data.active && !location.pathname.includes("/admin")) {
            setError("Cafe temporarily unavailable");
          } else {
            setCafeData(data);
            setError(null);
          }
        }
      } catch (err) {
        console.error("Error fetching cafe:", err);
        setError("Failed to load cafe details");
      } finally {
        setLoading(false);
      }
    };

    fetchCafe();
  }, [cafeSlug, location.pathname]);

  const value = {
    cafeId: cafeData?.id,
    cafeSlug: cafeData?.slug,
    cafeInfo: cafeData,
    loading,
    error
  };

  if (loading && !cafeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <p className="text-muted-foreground mb-6">Please check the URL or contact support if the problem persists.</p>
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-primary text-white rounded-full font-medium"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <CafeContext.Provider value={value}>
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (context === undefined) {
    throw new Error("useCafe must be used within a CafeProvider");
  }
  return context;
};
