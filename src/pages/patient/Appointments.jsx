import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../components/patient/Topbar.jsx";
import { getMesRendezVous, annulerRendezVous } from "../../services/rendezvous.js";
import {
  formatDateCourtApi,
  formatMoisCourtApi,
  formatDateLongApi,
  formatHeureApi,
  estAnnulableDansPlusDe6h,
} from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const STATUT_BADGE = {
  en_attente: { label: "En attente", cls: "b-warn" },
  confirme: { label: "Confirmé", cls: "b-green" },
  honore: { label: "Honoré", cls: "b-blue" },
  annule: { label: "Annulé", cls: "b-red" },
  absent: { label: "Absent", cls: "b-gray" },
};

const TABS = [
  { key: "a_venir", label: "À venir" },
  { key: "passes", label: "Passés" },
  { key: "annules", label: "Annulés" },
];

export default function PatientAppointments() {
  const [rdv, setRdv] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("a_venir");
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  function reload() {
    return getMesRendezVous()
      .then(setRdv)
      .catch((err) => setError(extractErrorMessage(err)));
  }

  useEffect(() => {
    reload();
  }, []);

  const aVenir = rdv?.a_venir ?? [];
  const passesTout = rdv?.passes ?? [];
  const passes = passesTout.filter((r) => r.statut !== "annule");
  const annules = passesTout.filter((r) => r.statut === "annule");
  const listes = { a_venir: aVenir, passes, annules };
  const liste = listes[tab];

  async function confirmerAnnulation() {
    setCancelling(true);
    setCancelError("");
    try {
      await annulerRendezVous(toCancel.id);
      setToCancel(null);
      await reload();
    } catch (err) {
      setCancelError(extractErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <Topbar title="Mes rendez-vous" subtitle="Gérez vos rendez-vous à venir et consultez votre historique.">
        <Link className="btn btn-primary" to="/patient/book">
          + Prendre un rendez-vous
        </Link>
      </Topbar>

      {error && <div className="alert-error">{error}</div>}

      <div className="tabs">
        {TABS.map((t) => (
          <div
            key={t.key}
            className={`tab${tab === t.key ? " active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({listes[t.key].length})
          </div>
        ))}
      </div>

      {tab === "a_venir" && aVenir.length > 0 && (
        <div className="card alert-info">
          <p>
            ℹ️ <b>Rappel :</b> vous pouvez annuler un rendez-vous jusqu'à <b>6 heures avant</b> l'horaire prévu, sans
            frais. Passé ce délai, contactez le secrétariat.
          </p>
        </div>
      )}

      <div className="card">
        {rdv === null ? (
          <p className="empty-state">Chargement…</p>
        ) : liste.length === 0 ? (
          <p className="empty-state">Aucun rendez-vous dans cette catégorie.</p>
        ) : (
          liste.map((r) => {
            const badge = STATUT_BADGE[r.statut] ?? { label: r.statut, cls: "b-gray" };
            const peutAnnuler =
              tab === "a_venir" &&
              (r.statut === "en_attente" || r.statut === "confirme") &&
              estAnnulableDansPlusDe6h(r.date_heure);

            return (
              <div className="rdv" key={r.id}>
                <div className={`date-block${tab !== "a_venir" ? " muted" : ""}`}>
                  <b>{formatDateCourtApi(r.date_heure)}</b>
                  <span>{formatMoisCourtApi(r.date_heure)}</span>
                </div>
                <div className="rdv-info">
                  <b>
                    Dr {r.medecin.user.prenom} {r.medecin.user.nom} — {r.medecin.specialite.nom}
                  </b>
                  <span>
                    {formatDateLongApi(r.date_heure)} · {formatHeureApi(r.date_heure)}
                    {r.motif ? ` · Motif : ${r.motif}` : ""}
                  </span>
                </div>
                <span className={`badge ${badge.cls}`}>● {badge.label}</span>
                {peutAnnuler && (
                  <div className="rdv-actions">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setToCancel(r);
                        setCancelError("");
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {toCancel && (
        <div className="modal-backdrop" onClick={() => !cancelling && setToCancel(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Annuler ce rendez-vous ?</h3>
            <p>
              Dr {toCancel.medecin.user.prenom} {toCancel.medecin.user.nom} — {formatDateLongApi(toCancel.date_heure)}{" "}
              à {formatHeureApi(toCancel.date_heure)}. Cette action est irréversible.
            </p>
            {cancelError && (
              <div className="alert-error" style={{ marginBottom: 14 }}>
                {cancelError}
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" disabled={cancelling} onClick={() => setToCancel(null)}>
                Retour
              </button>
              <button type="button" className="btn btn-danger" disabled={cancelling} onClick={confirmerAnnulation}>
                {cancelling ? "Annulation…" : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
