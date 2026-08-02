import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNonLuesCount, getNotifications, marquerLue, toutMarquerLu } from "../../services/notifications.js";

const ICONE_TYPE = { confirmation: "✅", rappel: "⏰", annulation: "🚫", info: "ℹ️" };

function formatRelatif(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  return `il y a ${jours} j`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const refreshCount = useCallback(() => {
    getNonLuesCount()
      .then(setCount)
      .catch(() => {});
  }, []);

  // Polling simple (pas de WebSocket) : suffisant pour un badge de compteur,
  // pas besoin de la complexité d'un canal temps réel pour ce cas d'usage.
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 60000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      getNotifications()
        .then((page) => setNotifications(page.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }

  async function handleClickNotification(notification) {
    if (!notification.lu_le) {
      try {
        await marquerLue(notification.id);
        setNotifications((current) =>
          current.map((n) => (n.id === notification.id ? { ...n, lu_le: new Date().toISOString() } : n))
        );
        setCount((c) => Math.max(0, c - 1));
      } catch {
        // Le marquage lu n'est pas bloquant : on navigue quand même vers le RDV concerné.
      }
    }
    setOpen(false);
    // Pas de page de détail par RDV dans l'application : la liste des rendez-vous
    // est la vue la plus proche du "détail du RDV concerné".
    navigate("/patient/appointments");
  }

  async function handleToutMarquerLu(e) {
    e.stopPropagation();
    try {
      await toutMarquerLu();
      setNotifications((current) => current.map((n) => ({ ...n, lu_le: n.lu_le ?? new Date().toISOString() })));
      setCount(0);
    } catch {
      // ignoré : l'utilisateur peut réessayer, l'état affiché reste cohérent avec le serveur au prochain chargement
    }
  }

  return (
    <div className="notif-bell" ref={ref}>
      <button type="button" className="icon-btn" onClick={handleToggle} aria-label="Notifications">
        🔔
        {count > 0 && <span className="dot"></span>}
      </button>
      {open && (
        <div className="user-menu notif-dropdown">
          <div className="notif-dropdown-head">
            <b>Notifications</b>
            {count > 0 && (
              <button type="button" className="notif-tout-lu" onClick={handleToutMarquerLu}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          {loading && <p className="empty-state">Chargement…</p>}
          {!loading && notifications.length === 0 && <p className="empty-state">Aucune notification.</p>}
          {!loading &&
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif${!n.lu_le ? " unread" : ""}`}
                onClick={() => handleClickNotification(n)}
                role="button"
                tabIndex={0}
              >
                <div className="ic">{ICONE_TYPE[n.type] ?? "ℹ️"}</div>
                <div>
                  <b>{n.contenu}</b>
                  <span>{formatRelatif(n.created_at)}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
