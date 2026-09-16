import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { getMe, login, logout, register } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");

  const { user, setUser, loading, setLoading } = context;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getMe();
        if (active) setUser(data.user ?? null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [setLoading, setUser]);

  const handleLogin = async (payload) => {
    setLoading(true);
    try {
      const data = await login(payload);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || "Login failed." };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setLoading(true);
    try {
      const data = await register(payload);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || "Registration failed." };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  };

  return { user, loading, handleLogin, handleRegister, handleLogout };
};
