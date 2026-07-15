import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const result = await authService.login(email, password);
    localStorage.setItem("token", result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }

  async function register(payload) {
    const result = await authService.register(payload);
    localStorage.setItem("token", result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // le token est peut-être déjà expiré côté serveur — on nettoie quand même localement
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() doit être utilisé à l'intérieur d'un <AuthProvider>.");
  }
  return ctx;
}
