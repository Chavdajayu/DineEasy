import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface SessionContextType {
  tableNumber: number | null;
  tableId: string | null;
  sessionId: string | null;
  setTableInfo: (tableNumber: number, tableId: string, sessionId: string) => void;
  clearSession: () => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Try to restore session from localStorage
    const storedTableNumber = localStorage.getItem("tableNumber");
    const storedTableId = localStorage.getItem("tableId");
    const storedSessionId = localStorage.getItem("sessionId");
    const storedIsAdmin = localStorage.getItem("isAdmin");

    if (storedTableNumber && storedTableId && storedSessionId) {
      setTableNumber(parseInt(storedTableNumber, 10));
      setTableId(storedTableId);
      setSessionId(storedSessionId);
    }

    if (storedIsAdmin === "true") {
      setIsAdmin(true);
    }
  }, []);

  const setTableInfo = (newTableNumber: number, newTableId: string, newSessionId: string) => {
    setTableNumber(newTableNumber);
    setTableId(newTableId);
    setSessionId(newSessionId);
    localStorage.setItem("tableNumber", newTableNumber.toString());
    localStorage.setItem("tableId", newTableId);
    localStorage.setItem("sessionId", newSessionId);
  };

  const clearSession = () => {
    setTableNumber(null);
    setTableId(null);
    setSessionId(null);
    setIsAdmin(false);
    localStorage.removeItem("tableNumber");
    localStorage.removeItem("tableId");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("isAdmin");
  };

  const handleSetIsAdmin = (value: boolean) => {
    setIsAdmin(value);
    localStorage.setItem("isAdmin", value.toString());
  };

  return (
    <SessionContext.Provider
      value={{
        tableNumber,
        tableId,
        sessionId,
        setTableInfo,
        clearSession,
        isAdmin,
        setIsAdmin: handleSetIsAdmin,
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

export { generateSessionId };
