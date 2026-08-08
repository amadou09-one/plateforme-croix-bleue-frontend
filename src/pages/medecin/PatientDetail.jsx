import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Topbar from "../../components/medecin/Topbar.jsx";
import ConsultationModal from "../../components/medecin/ConsultationModal.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getPatient } from "../../services/patients.js";
import { telechargerDocument } from "../../services/documents.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const STATUT_BADGE = {
  confirme: { label: "Confirmé", cls: "b-blue" },
  en_attente: { label: "En attente", cls: "b-warn" },
  honore: { label: "Honoré", cls: "b-green" },
  absent: { label: "Absent", cls: "b-red" },
  annule: { label: "Annulé", cls: "b-gray" },
};

function formatDateLongue(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function formatHeure(iso) {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")} h ${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function calculerAge(dateNaissance) {
  if (!dateNaissance) return null;
  const naissance = new Date(dateNaissance);
  const diff = new Date() - naissance;
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function calculerImc(poidsKg, tailleCm) {
  if (!poidsKg || !tailleCm) return null;
  const tailleM = tailleCm / 100;
  return (poidsKg / (tailleM * tailleM)).toFixed(1);
}

export default function MedecinPatientDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [fiche, setFiche] = useState(null);
  const [error, setError] = useState("");
  const [consultationRdv, setConsultationRdv] = useState(null);

  function chargerFiche() {
    return getPatient(id)
      .then((data) => {
        setFiche(data);
        return data;
      })
      .catch((err) => setError(extractErrorMessage(err)));
  }

  useEffect(() => {
    setFiche(null);
    setError("");
    chargerFiche().then((data) => {
      const rdvId = searchParams.get("rdv");
      if (data && rdvId) {
        const rdv = data.historique_rendez_vous.find((r) => String(r.id) === rdvId);
        if (rdv) setConsultationRdv(rdv);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function fermerModal() {
    setConsultationRdv(null);
    if (searchParams.get("rdv")) {
      searchParams.delete("rdv");
      setSearchParams(searchParams, { replace: true });
    }
  }

  function handleConsultationEnregistree(message) {
    showToast(message, "success");
    fermerModal();
    chargerFiche();
  }

  if (error) {
    return (
      <>
        <Topbar title="Dossier patient" />
        <div className="alert-error">{error}</div>
        <Link className="btn btn-ghost btn-sm" style={{ width: "fit-content" }} to="/medecin/patients">
          ← Retour à mes patients
        </Link>
      </>
    );
  }

  if (!fiche) {
    return (
      <>
        <Topbar title="Dossier patient" />
        <div className="card">
          <p className="empty-state">Chargement du dossier…</p>
        </div>
      </>
    );
  }

  const { patient, dossier_medical: dossier, traitements, documents, historique_rendez_vous: historique } = fiche;
  const age = calculerAge(patient.date_naissance);
  const imc = calculerImc(dossier.poids_kg, dossier.taille_cm);

  return (
    <>
      <Topbar title={`${patient.prenom} ${patient.nom}`} subtitle={age != null ? `${age} ans` : undefined} />

      <Link className="btn btn-ghost btn-sm" style={{ width: "fit-content" }} to="/medecin/patients">
        ← Retour à mes patients
      </Link>

      <div className="grid-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <h3>🚨 Allergies</h3>
            {dossier.allergies ? (
              <span className="allergy-tag">⚠️ {dossier.allergies}</span>
            ) : (
              <p style={{ color: "var(--sub)", fontSize: 13.5 }}>Aucune allergie connue.</p>
            )}
          </div>

          <div className="card">
            <h3>📋 Historique des consultations (avec vous)</h3>
            {historique.length === 0 ? (
              <p className="empty-state">Aucun rendez-vous enregistré.</p>
            ) : (
              historique.map((r) => {
                const badge = STATUT_BADGE[r.statut] ?? { label: r.statut, cls: "b-gray" };
                const traitementsRdv = traitements.filter((t) => t.rendez_vous_id === r.id);
                const documentsRdv = documents.filter((d) => d.rendez_vous_id === r.id);
                return (
                  <div className="blocage-row" key={r.id} style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <b>
                          {formatDateLongue(r.date_heure)} · {formatHeure(r.date_heure)}
                        </b>
                        {r.motif && <span>{r.motif}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                        {r.statut === "honore" && (
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setConsultationRdv(r)}>
                            {r.consultation ? "Modifier" : "+ Consultation"}
                          </button>
                        )}
                      </div>
                    </div>
                    {r.consultation && (r.consultation.diagnostic || r.consultation.observations) && (
                      <div style={{ fontSize: 12.5, background: "var(--bg)", borderRadius: 10, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                        {r.consultation.diagnostic && (
                          <span>
                            <b>Diagnostic : </b>
                            {r.consultation.diagnostic}
                          </span>
                        )}
                        {r.consultation.observations && (
                          <span>
                            <b>Observations : </b>
                            {r.consultation.observations}
                          </span>
                        )}
                      </div>
                    )}
                    {(traitementsRdv.length > 0 || documentsRdv.length > 0) && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {traitementsRdv.map((t) => (
                          <span key={t.id} className="badge b-blue">
                            💊 {t.medicament}
                          </span>
                        ))}
                        {documentsRdv.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            className="badge b-green"
                            style={{ border: "none" }}
                            onClick={() => telechargerDocument(d.id, d.titre)}
                          >
                            📄 {d.titre}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="card">
            <h3>💊 Traitements prescrits</h3>
            {traitements.length === 0 ? (
              <p className="empty-state">Aucun traitement prescrit par vous pour ce patient.</p>
            ) : (
              traitements.map((t) => (
                <div className="blocage-row" key={t.id}>
                  <div>
                    <b>{t.medicament}</b>
                    <span>
                      {t.posologie} — depuis le {formatDateLongue(t.date_debut)}
                      {t.date_fin ? ` jusqu'au ${formatDateLongue(t.date_fin)}` : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <h3>ℹ️ Informations</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--sub)" }}>E-mail</span>
                <b>{patient.email}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--sub)" }}>Téléphone</span>
                <b>{patient.telephone}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--sub)" }}>Sexe</span>
                <b>{patient.sexe === "F" ? "Femme" : patient.sexe === "M" ? "Homme" : "Non précisé"}</b>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>🩺 Constantes</h3>
            <div className="vitals">
              <div className="vital">
                <b>{dossier.groupe_sanguin ?? "—"}</b>
                <span>Groupe sanguin</span>
              </div>
              <div className="vital">
                <b>{dossier.tension ?? "—"}</b>
                <span>Tension</span>
              </div>
              <div className="vital">
                <b>{dossier.poids_kg ? `${dossier.poids_kg} kg` : "—"}</b>
                <span>Poids</span>
              </div>
              <div className="vital">
                <b>{dossier.taille_cm ? `${dossier.taille_cm} cm` : "—"}</b>
                <span>Taille</span>
              </div>
              <div className="vital">
                <b>{imc ?? "—"}</b>
                <span>IMC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {consultationRdv && (
        <ConsultationModal
          patient={patient}
          allergies={dossier.allergies}
          rendezVous={consultationRdv}
          traitementsExistants={traitements.filter((t) => t.rendez_vous_id === consultationRdv.id)}
          onClose={fermerModal}
          onSaved={handleConsultationEnregistree}
        />
      )}
    </>
  );
}
