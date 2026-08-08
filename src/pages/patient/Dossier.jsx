import { useEffect, useState } from "react";
import Topbar from "../../components/patient/Topbar.jsx";
import { getDossierMedical } from "../../services/patientDossier.js";
import { telechargerDocument } from "../../services/documents.js";
import { formatDateLongApi } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

function formatDateCourte(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function PatientDossier() {
  const [dossier, setDossier] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDossierMedical()
      .then(setDossier)
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  if (error) {
    return (
      <>
        <Topbar title="Dossier médical" />
        <div className="alert-error">{error}</div>
      </>
    );
  }

  if (!dossier) {
    return (
      <>
        <Topbar title="Dossier médical" />
        <div className="card">
          <p className="empty-state">Chargement de votre dossier…</p>
        </div>
      </>
    );
  }

  const { dossier_medical: infos, historique_consultations: historique, traitements, documents } = dossier;
  const traitementsActifs = traitements.filter((t) => !t.date_fin || new Date(t.date_fin) >= new Date());

  return (
    <>
      <Topbar title="Dossier médical" subtitle="Vos consultations effectuées, traitements et documents." />

      <div className="grid-2">
        <div className="card">
          <h3>
            🩺 Consultations effectuées <span className="badge b-blue">{historique.length} au total</span>
          </h3>
          {historique.length === 0 ? (
            <p className="empty-state">Aucune consultation honorée pour le moment.</p>
          ) : (
            historique.map((r) => {
              const docsRdv = documents.filter((d) => d.rendez_vous_id === r.id);
              const d = new Date(r.date_heure);
              return (
                <div className="rdv" key={r.id}>
                  <div className="date-block">
                    <b>{String(d.getUTCDate()).padStart(2, "0")}</b>
                    <span>{d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }).replace(".", "")}</span>
                  </div>
                  <div className="rdv-info">
                    <b>
                      Dr {r.medecin?.user?.prenom} {r.medecin?.user?.nom}
                      {r.medecin?.specialite ? ` — ${r.medecin.specialite.nom}` : ""}
                    </b>
                    <span>{r.consultation?.diagnostic || r.motif || "Consultation honorée"}</span>
                    {docsRdv.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                        {docsRdv.map((doc) => (
                          <button key={doc.id} type="button" className="doc-chip" onClick={() => telechargerDocument(doc.id, doc.titre)}>
                            📄 {doc.titre}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="badge b-blue">Honoré</span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <h3>
              💊 Traitements en cours <span className="badge b-green">{traitementsActifs.length} actif{traitementsActifs.length > 1 ? "s" : ""}</span>
            </h3>
            {traitements.length === 0 ? (
              <p className="empty-state">Aucun traitement enregistré.</p>
            ) : (
              traitements.map((t) => (
                <div className="trait" key={t.id}>
                  <div className="ic">💊</div>
                  <div style={{ flex: 1 }}>
                    <b>{t.medicament}</b>
                    <span>
                      {t.posologie} · Dr {t.medecin?.user?.prenom} {t.medecin?.user?.nom}
                      {t.date_fin ? ` · jusqu'au ${formatDateCourte(t.date_fin)}` : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h3>📁 Documents</h3>
            {documents.length === 0 ? (
              <p className="empty-state">Aucun document disponible.</p>
            ) : (
              documents.map((doc) => (
                <div className="notif" key={doc.id} style={{ cursor: "default" }}>
                  <div className="ic">📄</div>
                  <div style={{ flex: 1 }}>
                    <b>{doc.titre}</b>
                    <span>{formatDateLongApi(doc.created_at)}</span>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => telechargerDocument(doc.id, doc.titre)}>
                    ⬇
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ background: "var(--warn-light)", border: "1px solid #FDE9C3" }}>
            <p style={{ fontSize: 12.5 }}>
              ⚠️ <b>Allergies connues :</b> {infos.allergies || "Aucune allergie connue."}
              <br />
              <span style={{ color: "var(--sub)", fontSize: 11.5 }}>Ces informations sont visibles par tous les médecins de la clinique.</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
