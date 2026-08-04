import { NavLink, Outlet } from "react-router-dom";
import { ToastProvider } from "../context/ToastContext.jsx";
import "../styles/admin.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Tableau de bord", icon: "📊", end: true },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: "🧑🏾‍🤝‍🧑🏾" },
];

export default function AdminLayout() {
  return (
    <div className="admin-app">
      <ToastProvider>
        <div className="app">
          <aside className="sidebar">
            <a className="logo" href="/">
              <div className="logo-mark">✚</div>
              <div>
                <b>Croix Bleue</b>
                <span>Espace Admin</span>
              </div>
            </a>
            <div className="nav-label">Menu</div>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              >
                <span className="ic">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <div className="sidebar-foot">
              <span className="nav-item" style={{ opacity: 0.5, cursor: "default" }} title="Bientôt disponible">
                <span className="ic">⚙️</span>Paramètres
              </span>
            </div>
          </aside>
          <main className="main">
            <Outlet />
          </main>
        </div>
      </ToastProvider>
    </div>
  );
}
