import { createContext, useContext, useState, useCallback } from "react";
import { login as loginRequest, register as registerRequest } from "../api/client.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "fmc-token";
const USER_KEY = "fmc-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const persist = useCallback((token, userData) => {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { token, user: userData } = await loginRequest(email, password);
      persist(token, userData);
      return userData;
    },
    [persist]
  );

  const register = useCallback(
    async (name, email, password) => {
      const { token, user: userData } = await registerRequest(name, email, password);
      persist(token, userData);
      return userData;
    },
    [persist]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
