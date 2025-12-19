import { createContext, useContext, useState, useEffect } from "react";

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [tableNumber, setTableNumber] = useState(null);
  const [tableId, setTableId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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

  const setTableInfo = (newTableNumber, newTableId, newSessionId) => {
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

  const handleSetIsAdmin = (value) => {
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

