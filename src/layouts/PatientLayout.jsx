import { NavLink, Outlet } from "react-router-dom";
import { ToastProvider } from "../context/ToastContext.jsx";
import "../styles/app.css";

const NAV_ITEMS = [
  { to: "/patient", label: "Dashboard", icon: "📊", end: true },
  { to: "/patient/book", label: "Prendre RDV", icon: "📅" },
  { to: "/patient/appointments", label: "Mes rendez-vous", icon: "📝" },
];

export default function PatientLayout() {
  return (
    <div className="patient-app">
      <ToastProvider>
        <div className="app">
          <aside className="sidebar">
            <a className="logo" href="/">
              <div className="logo-mark">✚</div>
              <div>
                <b>Croix Bleue</b>
                <span>Espace Patient</span>
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
              <NavLink to="/patient/parametres" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                <span className="ic">⚙️</span>Paramètres
              </NavLink>
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
