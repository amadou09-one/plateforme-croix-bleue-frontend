import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../components/patient/Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMesRendezVous } from "../../services/rendezvous.js";
import {
  formatDateCourtApi,
  formatMoisCourtApi,
  formatHeureApi,
  formatDateLongApi,
  formatDateLongLocale,
} from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const STATUT_BADGE = {
  en_attente: { label: "En attente", cls: "b-warn" },
  confirme: { label: "Confirmé", cls: "b-green" },
  honore: { label: "Honoré", cls: "b-blue" },
  annule: { label: "Annulé", cls: "b-red" },
  absent: { label: "Absent", cls: "b-gray" },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [rdv, setRdv] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMesRendezVous()
      .then(setRdv)
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  const aVenir = rdv?.a_venir ?? [];
  const passes = rdv?.passes ?? [];
  const nbHonores = passes.filter((r) => r.statut === "honore").length;
  const prochain = aVenir[0];

  return (
    <>
      <Topbar
        title={`Bonjour, ${user?.prenom} 👋`}
        subtitle={`${formatDateLongLocale(new Date())} — voici un aperçu de vos rendez-vous.`}
      >
        <Link className="btn btn-primary" to="/patient/book">
          + Prendre un rendez-vous
        </Link>
      </Topbar>

      {error && <div className="alert-error">{error}</div>}

      {!rdv && !error && (
        <div className="card">
          <p className="empty-state">Chargement de votre tableau de bord…</p>
        </div>
      )}

      {rdv && (
        <>
          <div className="grid-3">
            <div className="card stat">
              <div className="ic">📅</div>
              <div>
                <b>{prochain ? `${formatDateCourtApi(prochain.date_heure)} ${formatMoisCourtApi(prochain.date_heure)}` : "—"}</b>
                <span>Prochain rendez-vous</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">⏳</div>
              <div>
                <b>{aVenir.length}</b>
                <span>RDV à venir</span>
              </div>
            </div>
            <div className="card stat">
              <div className="ic">✅</div>
              <div>
                <b>{nbHonores}</b>
                <span>RDV honorés</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {prochain && (
                <div className="card">
                  <h3>
                    Prochain rendez-vous{" "}
                    <span className={`badge ${STATUT_BADGE[prochain.statut]?.cls ?? "b-gray"}`}>
                      ● {STATUT_BADGE[prochain.statut]?.label ?? prochain.statut}
                    </span>
                  </h3>
                  <div className="rdv" style={{ border: "none", padding: "0" }}>
                    <div className="date-block">
                      <b>{formatDateCourtApi(prochain.date_heure)}</b>
                      <span>{formatMoisCourtApi(prochain.date_heure)}</span>
                    </div>
                    <div className="rdv-info">
                      <b>
                        Dr {prochain.medecin.user.prenom} {prochain.medecin.user.nom} — {prochain.medecin.specialite.nom}
                      </b>
                      <span>
                        {formatDateLongApi(prochain.date_heure)} · {formatHeureApi(prochain.date_heure)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <h3>
                  Mes prochains rendez-vous <Link to="/patient/appointments">Tout voir →</Link>
                </h3>
                {aVenir.length === 0 ? (
                  <p className="empty-state">Aucun rendez-vous à venir pour l'instant.</p>
                ) : (
                  aVenir.slice(0, 3).map((r) => (
                    <div className="rdv" key={r.id}>
                      <div className="date-block">
                        <b>{formatDateCourtApi(r.date_heure)}</b>
                        <span>{formatMoisCourtApi(r.date_heure)}</span>
                      </div>
                      <div className="rdv-info">
                        <b>
                          Dr {r.medecin.user.prenom} {r.medecin.user.nom} — {r.medecin.specialite.nom}
                        </b>
                        <span>{formatHeureApi(r.date_heure)}</span>
                      </div>
                      <span className={`badge ${STATUT_BADGE[r.statut]?.cls ?? "b-gray"}`}>
                        {STATUT_BADGE[r.statut]?.label ?? r.statut}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg,#0A5BD0,#3D9BFF)", color: "#fff", border: "none" }}>
              <h3 style={{ color: "#fff", marginBottom: 8 }}>Besoin d'une consultation ?</h3>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>
                Réservez un créneau avec l'un de nos spécialistes en moins de 3 minutes.
              </p>
              <Link className="btn" style={{ background: "#fff", color: "var(--blue)" }} to="/patient/book">
                📅 Prendre un rendez-vous
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
