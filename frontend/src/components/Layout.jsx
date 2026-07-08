import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { usuario, logout } = useAuth();
  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className="app-title">Controle Financeiro</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/categorias">Categorias</NavLink>
          <NavLink to="/transacoes">Transações</NavLink>
        </nav>
        <div className="app-user">
          <span className="app-user-nome">{usuario?.nome}</span>
          <div className="avatar" title={usuario?.nome}>{inicial}</div>
          <button
            onClick={logout}
            className="secundario"
            style={{ fontSize: "0.82rem", padding: "0.35rem 0.75rem" }}
          >
            Sair
          </button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
