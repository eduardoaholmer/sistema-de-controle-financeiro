import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Controle Financeiro</span>
        <nav className="app-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/categorias">Categorias</NavLink>
          <NavLink to="/transacoes">Transações</NavLink>
        </nav>
        <div className="app-user">
          <span>{usuario?.nome}</span>
          <button onClick={logout}>Sair</button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
