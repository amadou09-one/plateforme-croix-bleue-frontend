import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../components/secretaire/Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStats, getPlanning, confirmerRdv } from "../../services/secretaire.js";
import { formatDateLongLocale, formatHeureSlot } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const STATUT_BADGE = {
  confirme: { label: "Confirmé", cls: "b-blue" },
  en_attente: { label: "En attente", cls: "b-warn" },
  honore: { label: "Honoré", cls: "b-green" },
  absent: { label: "Absent", cls: "b-red" },
};

const MEDECIN_STATUT_BADGE = {
  en_consultation: { label: "● En consultation", cls: "b-green" },
  disponible: { label: "● Disponible", cls: "b-green" },
};

function initiales(patient) {
  const a = patient?.prenom?.charAt(0) ?? "";
  const b = patient?.nom?.charAt(0) ?? "";
  return (a + b).toUpperCase();
}

function extraireRendezVousDuJour(planning) {
  const lignes = [];
  for (const ligne of planning ?? []) {
    for (const entree of ligne.medecins) {
      if (entree.statut === "rdv" && entree.rdv) {
        lignes.push({ heure: ligne.heure, medecin: entree.nom, ...entree.rdv });
      }
    }
  }
  return lignes.sort((a, b) => a.heure.localeCompare(b.heure));
}

export default function SecretaireDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [error, setError] = useState("");
  const [enCours, setEnCours] = useState({});

  useEffect(() => {
    Promise.all([getStats(), getPlanning()])
      .then(([statsData, planningData]) => {
        setStats(statsData);
        setRendezVous(extraireRendezVousDuJour(planningData.planning));
      })
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  async function handleConfirmer(rdv) {
    setEnCours((c) => ({ ...c, [rdv.id]: true }));
    setError("");
    try {
      await confirmerRdv(rdv.id);
      setRendezVous((current) => current.map((r) => (r.id === rdv.id ? { ...r, statut: "confirme" } : r)));
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setEnCours((c) => {
        const suivant = { ...c };
        delete suivant[rdv.id];
        return suivant;
      });
    }
  }

  return (
    <>
      <Topbar
        title={`Bonjour, ${user?.prenom ?? ""} 👋`}
        subtitle={`${formatDateLongLocale(new Date())} — vue d'ensemble de la journée.`}
      />

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
              <div className="ic">📅</div>
              <div>
                <b>{stats.rdv_aujourdhui}</b>
                <span>Rendez-vous aujourd'hui</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">⏳</div>
              <div>
                <b>{stats.en_attente_confirmation}</b>
                <span>En attente de confirmation</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">🧑🏾‍🤝‍🧑🏾</div>
              <div>
                <b>{stats.nouveaux_patients_semaine}</b>
                <span>Nouveaux patients cette semaine</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">👨🏾‍⚕️</div>
              <div>
                <b>
                  {stats.medecins_presents_aujourdhui.length}/{stats.medecins_total_actifs}
                </b>
                <span>Médecins présents</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>
                Prochains rendez-vous — tous médecins <Link to="/secretaire/planning">Planning complet →</Link>
              </h3>
              {rendezVous.length === 0 ? (
                <p className="empty-state">Aucun rendez-vous aujourd'hui.</p>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Heure</th>
                      <th>Patient</th>
                      <th>Médecin</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendezVous.map((rdv) => {
                      const badge = STATUT_BADGE[rdv.statut] ?? { label: rdv.statut, cls: "b-gray" };
                      return (
                        <tr key={rdv.id}>
                          <td>
                            <b>{formatHeureSlot(rdv.heure)}</b>
                          </td>
                          <td>
                            <div className="cell">
                              <div className="avatar">{initiales(rdv.patient)}</div>
                              <span>
                                {rdv.patient?.prenom} {rdv.patient?.nom}
                              </span>
                            </div>
                          </td>
                          <td>{rdv.medecin}</td>
                          <td>
                            <span className={`badge ${badge.cls}`}>{badge.label}</span>
                          </td>
                          <td>
                            {rdv.statut === "en_attente" ? (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                disabled={enCours[rdv.id]}
                                onClick={() => handleConfirmer(rdv)}
                              >
                                {enCours[rdv.id] ? "…" : "Confirmer"}
                              </button>
                            ) : (
                              <span style={{ color: "var(--sub)", fontSize: 12.5 }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card">
              <h3>Médecins présents aujourd'hui</h3>
              {stats.medecins_presents_aujourdhui.length === 0 ? (
                <p className="empty-state">Aucun médecin présent aujourd'hui.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stats.medecins_presents_aujourdhui.map((m) => {
                    const badge = MEDECIN_STATUT_BADGE[m.statut] ?? { label: m.statut, cls: "b-gray" };
                    return (
                      <div key={m.nom} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13.5 }}>{m.nom}</span>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
