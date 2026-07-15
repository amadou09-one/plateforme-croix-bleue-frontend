import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/dashboard.css";

export default function DashboardPlaceholder({ title }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <div className="dashboard-placeholder">
      <div className="card">
        <h1>{title}</h1>
        <p className="greeting">Bonjour {user?.prenom} 👋</p>
        <button className="btn-logout" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Déconnexion…" : "Déconnexion"}
        </button>
      </div>
    </div>
  );
}
