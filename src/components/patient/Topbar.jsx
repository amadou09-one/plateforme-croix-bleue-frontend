import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar({ title, subtitle, actions }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <div className="topbar">
      <div className="page-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="top-actions">
        <div className="icon-btn">
          🔔<span className="dot"></span>
        </div>
        <div className="top-user" ref={menuRef} onClick={() => setMenuOpen((v) => !v)}>
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 15 }}>
            {user?.sexe === "M" ? "🧑🏾" : "👩🏾"}
          </div>
          <div>
            <b style={{ fontSize: 13, display: "block", lineHeight: 1.2 }}>
              {user?.prenom} {user?.nom}
            </b>
            <span style={{ fontSize: 10.5, color: "var(--sub)" }}>
              Patient{user?.sexe === "F" ? "e" : ""}
            </span>
          </div>
          <span style={{ color: "var(--sub)", fontSize: 12 }}>▾</span>
          {menuOpen && (
            <div className="user-menu">
              <Link to="/patient">👤 Mon profil</Link>
              <div className="um-sep"></div>
              <button type="button" className="um-danger" onClick={handleLogout} disabled={loggingOut}>
                🚪 {loggingOut ? "Déconnexion…" : "Déconnexion"}
              </button>
            </div>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}
