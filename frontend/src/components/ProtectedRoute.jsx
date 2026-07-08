import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { usuario, carregando } = useAuth();

  if (carregando) return <p className="carregando">Carregando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;

  return <Outlet />;
}
