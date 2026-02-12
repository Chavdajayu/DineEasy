import { createContext, useContext, useState, useEffect } from "react";
import { useCafe } from "./CafeProvider";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const { cafeId } = useCafe();
  const [session, setSession] = useState(null);

  // Clear session if cafeId changes
  useEffect(() => {
    setSession(null);
  }, [cafeId]);

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

