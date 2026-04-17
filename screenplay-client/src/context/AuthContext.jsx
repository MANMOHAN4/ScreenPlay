import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

const TOKEN_KEY = "sp_token";
const USER_KEY = "sp_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until localStorage restore is done

  // ── Restore session on every page load / refresh ─────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // Attach header immediately so any request fired on mount is authenticated
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch {
      // Corrupted storage — wipe it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false); // guards can now render
    }
  }, []);

  // ── login ─────────────────────────────────────────────────────
  const login = useCallback((newToken, userData) => {
    // Persist
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    // Update axios default header
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    // Update state
    setToken(newToken);
    setUser(userData);
  }, []);

  // ── logout ────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  // ── updateUser (used by profile pages after name change) ──────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
