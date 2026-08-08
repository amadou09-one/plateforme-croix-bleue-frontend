import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../components/medecin/Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAgenda, getStats, changerStatutRdv } from "../../services/medecin.js";
import { getCreneaux } from "../../services/rendezvous.js";
import { formatDateLongLocale, formatHeureApi, formatHeureCleApi, formatHeureSlot, toDateKey } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const STATUT_BADGE = {
  confirme: { label: "Confirmé", cls: "b-blue" },
  en_attente: { label: "En attente", cls: "b-warn" },
  honore: { label: "✓ Honoré", cls: "b-green" },
  absent: { label: "✕ Absent", cls: "b-red" },
};

function initiales(patient) {
  const a = patient?.prenom?.charAt(0) ?? "";
  const b = patient?.nom?.charAt(0) ?? "";
  return (a + b).toUpperCase();
}

function construireTimeline(creneaux, agenda) {
  const parCle = new Map(agenda.map((rdv) => [formatHeureCleApi(rdv.date_heure), rdv]));
  const heuresGrille = new Set(creneaux.map((c) => c.heure));

  const lignes = creneaux.map((c) => ({ heure: c.heure, rdv: parCle.get(c.heure) ?? null }));

  for (const rdv of agenda) {
    const heure = formatHeureCleApi(rdv.date_heure);
    if (!heuresGrille.has(heure)) {
      lignes.push({ heure, rdv });
    }
  }

  return lignes.sort((a, b) => a.heure.localeCompare(b.heure));
}

export default function MedecinDashboard() {
  const { user } = useAuth();
  const medecinId = user?.medecin?.id;

  const [agenda, setAgenda] = useState(null);
  const [creneaux, setCreneaux] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [enCours, setEnCours] = useState({});

  useEffect(() => {
    if (!medecinId) return;
    const aujourdhui = toDateKey(new Date());

    Promise.all([getAgenda(aujourdhui), getCreneaux(medecinId, aujourdhui), getStats()])
      .then(([agendaData, creneauxData, statsData]) => {
        setAgenda(agendaData);
        setCreneaux(creneauxData);
        setStats(statsData);
      })
      .catch((err) => setError(extractErrorMessage(err)));
  }, [medecinId]);

  const timeline = useMemo(() => construireTimeline(creneaux, agenda ?? []), [creneaux, agenda]);

  const prochainPatient = useMemo(() => {
    const maintenant = new Date();
    return (agenda ?? [])
      .filter((r) => new Date(r.date_heure) > maintenant && ["en_attente", "confirme"].includes(r.statut))
      .sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure))[0] ?? null;
  }, [agenda]);

  async function handleChangerStatut(rdv, statut) {
    setEnCours((c) => ({ ...c, [rdv.id]: true }));
    setError("");
    const precedent = agenda;

    setAgenda((current) => current.map((r) => (r.id === rdv.id ? { ...r, statut } : r)));

    try {
      await changerStatutRdv(rdv.id, statut);
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      setAgenda(precedent);
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
      <Topbar title={`Bonjour, Dr ${user?.nom ?? ""} 👋`} subtitle={`${formatDateLongLocale(new Date())} — voici votre journée.`} />

      {error && <div className="alert-error">{error}</div>}

      {!stats && !error && (
        <div className="card">
          <p className="empty-state">Chargement de votre tableau de bord…</p>
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
              <div className="ic">✅</div>
              <div>
                <b>{stats.patients_vus_aujourdhui}</b>
                <span>Patients déjà vus</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">⏳</div>
              <div>
                <b>{prochainPatient ? formatHeureApi(prochainPatient.date_heure) : "—"}</b>
                <span>Prochain patient</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">📈</div>
              <div>
                <b>{stats.consultations_ce_mois}</b>
                <span>Consultations ce mois</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>Agenda du jour — {formatDateLongLocale(new Date())}</h3>
              {timeline.length === 0 ? (
                <p className="empty-state">Aucune disponibilité configurée pour aujourd'hui.</p>
              ) : (
                <div className="timeline">
                  {timeline.map((ligne, index) => {
                    const rdv = ligne.rdv;
                    const estDernier = index === timeline.length - 1;
                    const ligneStyle = estDernier ? { borderLeft: "2px solid transparent" } : undefined;

                    if (!rdv) {
                      return (
                        <div className="tl-row" key={ligne.heure}>
                          <div className="tl-time">{formatHeureSlot(ligne.heure)}</div>
                          <div className="tl-line" style={ligneStyle}>
                            <div className="tl-dot empty"></div>
                            <div className="empty-slot">Créneau libre</div>
                          </div>
                        </div>
                      );
                    }

                    const peutTraiter = rdv.statut === "confirme" && new Date(rdv.date_heure) <= new Date();
                    const dotCls = rdv.statut === "honore" ? "done" : rdv.statut === "absent" ? "absent" : "";
                    const apptCls = ["confirme", "en_attente"].includes(rdv.statut) ? " confirmed" : "";
                    const badge = STATUT_BADGE[rdv.statut];

                    return (
                      <div className="tl-row" key={rdv.id}>
                        <div className="tl-time">{formatHeureApi(rdv.date_heure)}</div>
                        <div className="tl-line" style={ligneStyle}>
                          <div className={`tl-dot ${dotCls}`}></div>
                          <div className={`appt${apptCls}`}>
                            <div className="pat-avatar">{initiales(rdv.patient)}</div>
                            <div className="appt-info">
                              <b>
                                {rdv.patient?.prenom} {rdv.patient?.nom}
                              </b>
                              <span>{rdv.motif || "Motif non renseigné"}</span>
                            </div>
                            {peutTraiter ? (
                              <div className="appt-actions">
                                <button
                                  type="button"
                                  className="btn btn-green btn-sm"
                                  disabled={enCours[rdv.id]}
                                  onClick={() => handleChangerStatut(rdv, "honore")}
                                >
                                  ✓ Honoré
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  disabled={enCours[rdv.id]}
                                  onClick={() => handleChangerStatut(rdv, "absent")}
                                >
                                  ✕ Absent
                                </button>
                              </div>
                            ) : rdv.statut === "honore" ? (
                              <div className="appt-actions" style={{ alignItems: "center" }}>
                                <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                <Link
                                  className="btn btn-outline btn-sm"
                                  to={`/medecin/patients/${rdv.patient.id}?rdv=${rdv.id}`}
                                >
                                  + Consultation
                                </Link>
                              </div>
                            ) : (
                              badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="card" style={{ background: "linear-gradient(135deg,#0284C7,#38BDF8)", color: "#fff", border: "none" }}>
                <h3 style={{ color: "#fff", marginBottom: 8 }}>Prochain patient</h3>
                {prochainPatient ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="avatar" style={{ width: 46, height: 46 }}>
                      {initiales(prochainPatient.patient)}
                    </div>
                    <div>
                      <b style={{ fontSize: 15 }}>
                        {prochainPatient.patient?.prenom} {prochainPatient.patient?.nom}
                      </b>
                      <br />
                      <span style={{ fontSize: 12, opacity: 0.85 }}>
                        {formatHeureApi(prochainPatient.date_heure)} · {prochainPatient.motif || "Motif non renseigné"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, opacity: 0.9 }}>Plus aucun patient à venir aujourd'hui.</p>
                )}
              </div>

              <div className="card">
                <h3>Cette semaine</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span style={{ color: "var(--sub)" }}>Rendez-vous programmés</span>
                    <b>{stats.rdv_semaine}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span style={{ color: "var(--sub)" }}>Nouveaux patients</span>
                    <b>{stats.nouveaux_patients_semaine}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span style={{ color: "var(--sub)" }}>Taux d'absence</span>
                    <b style={{ color: "#EF4444" }}>{stats.taux_absence_semaine} %</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span style={{ color: "var(--sub)" }}>Créneaux disponibles</span>
                    <b style={{ color: "#16A34A" }}>{stats.creneaux_disponibles_semaine}</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
