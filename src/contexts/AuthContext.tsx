import { createContext, useContext, useState, ReactNode } from "react";
import { buildLoginEvent, type LoginEvent } from "@/lib/login-history";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { name: string; role: string } | null;
  loginEvents: LoginEvent[];
  login: (id: string, password: string) => boolean;
  adminLogin: (password: string) => boolean;
  logout: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([]);

  const login = (id: string, password: string) => {
    // Demo login - will be replaced with Supabase
    if (id && password) {
      setIsAuthenticated(true);
      setUser({ name: id, role: "Opérateur" });
      
      // Record login event
      const event = buildLoginEvent({
        user: id,
        role: "Opérateur",
        type: "login",
      });
      setLoginEvents(prev => [...prev, event]);
      
      return true;
    }
    return false;
  };

  const adminLogin = (password: string) => {
    // Demo admin - will be replaced with Supabase
    if (password === "admin") {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Record logout event before clearing user
    if (user) {
      const event = buildLoginEvent({
        user: user.name,
        role: user.role,
        type: "logout",
      });
      setLoginEvents(prev => [...prev, event]);
    }
    
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, loginEvents, login, adminLogin, logout, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
