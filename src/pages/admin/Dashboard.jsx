import { useEffect, useState } from "react";
import Topbar from "../../components/admin/Topbar.jsx";
import { getStats } from "../../services/admin.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const ACTIVITE_RECENTE = [
  { icone: "🆕", titre: "Nouveau patient inscrit", detail: "Sur la plateforme" },
  { icone: "👨🏾‍⚕️", titre: "Compte médecin créé", detail: "Via l'espace admin" },
  { icone: "💬", titre: "Nouveau message de contact", detail: "Depuis le site vitrine" },
  { icone: "📅", titre: "Rendez-vous confirmé", detail: "Par le secrétariat" },
];

function tauxBadgeClasse(taux) {
  if (taux >= 85) return "b-green";
  if (taux >= 60) return "b-warn";
  return "b-red";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  const maxRdv = stats ? Math.max(1, ...stats.evolution_rdv_6_mois.map((m) => m.total)) : 1;

  return (
    <>
      <Topbar title="Tableau de bord" subtitle="Vue d'ensemble de la Clinique Croix Bleue." />

      {error && <div className="alert-error">{error}</div>}

      {!stats && !error && (
        <div className="card">
          <p className="empty-state">Chargement du tableau de bord…</p>
        </div>
      )}

      {stats && (
        <>
          <div className="grid-4">
            <div className="card stat">
              <div className="ic">🧑🏾‍🤝‍🧑🏾</div>
              <div>
                <b>{stats.total_patients}</b>
                <span>Patients inscrits</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">👨🏾‍⚕️</div>
              <div>
                <b>{stats.medecins_actifs}</b>
                <span>Médecins actifs</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">📅</div>
              <div>
                <b>{stats.rdv_ce_mois}</b>
                <span>RDV ce mois</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">💬</div>
              <div>
                <b>{stats.messages_non_traites}</b>
                <span>Messages non traités</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>📈 Rendez-vous — 6 derniers mois</h3>
              <div className="bars">
                {stats.evolution_rdv_6_mois.map((mois) => (
                  <div className="bar-col" key={mois.mois}>
                    <div className="bar" style={{ height: `${Math.max(4, (mois.total / maxRdv) * 100)}%` }} />
                    <span>{mois.mois.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Activité récente</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {ACTIVITE_RECENTE.map((a) => (
                  <div key={a.titre} style={{ display: "flex", gap: 11 }}>
                    <span>{a.icone}</span>
                    <div>
                      <b style={{ fontSize: 13, display: "block" }}>{a.titre}</b>
                      <span style={{ fontSize: 11.5, color: "var(--sub)" }}>{a.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Répartition par spécialité</h3>
            {stats.repartition_specialites.length === 0 ? (
              <p className="empty-state">Aucune spécialité avec un médecin actif pour le moment.</p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Spécialité</th>
                    <th>Médecins</th>
                    <th>RDV ce mois</th>
                    <th>Taux d'occupation</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.repartition_specialites.map((s) => (
                    <tr key={s.nom}>
                      <td>
                        <b>{s.nom}</b>
                      </td>
                      <td>{s.medecins}</td>
                      <td>{s.rdv_mois}</td>
                      <td>
                        <span className={`badge ${tauxBadgeClasse(s.taux_occupation)}`}>{s.taux_occupation} %</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}
