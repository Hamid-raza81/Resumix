import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function Protected({ children }) {
  const { loading, user } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Checking session...</div>;
  return user ? children : <Navigate to="/login" replace />;
}
