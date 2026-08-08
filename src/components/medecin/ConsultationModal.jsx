import { useState } from "react";
import { enregistrerConsultation } from "../../services/consultations.js";
import { ajouterTraitement, genererOrdonnance } from "../../services/patients.js";
import { telechargerDocument } from "../../services/documents.js";
import { formatDateLongApi, formatHeureApi } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const LIGNE_VIDE = { medicament: "", posologie: "", date_debut: new Date().toISOString().slice(0, 10), date_fin: "" };

export default function ConsultationModal({ patient, allergies, rendezVous, traitementsExistants, onClose, onSaved }) {
  const [diagnostic, setDiagnostic] = useState(rendezVous.consultation?.diagnostic ?? "");
  const [observations, setObservations] = useState(rendezVous.consultation?.observations ?? "");
  const [lignes, setLignes] = useState([{ ...LIGNE_VIDE }]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  function handleChangeLigne(index, champ, valeur) {
    setLignes((current) => current.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)));
  }

  function ajouterLigne() {
    setLignes((current) => [...current, { ...LIGNE_VIDE }]);
  }

  function retirerLigne(index) {
    setLignes((current) => current.filter((_, i) => i !== index));
  }

  function lignesRemplies() {
    return lignes.filter((l) => l.medicament.trim() && l.posologie.trim() && l.date_debut);
  }

  async function persisterNouvellesLignes() {
    const aEnregistrer = lignesRemplies();
    for (const ligne of aEnregistrer) {
      await ajouterTraitement(patient.id, {
        medicament: ligne.medicament,
        posologie: ligne.posologie,
        date_debut: ligne.date_debut,
        date_fin: ligne.date_fin || undefined,
        rendez_vous_id: rendezVous.id,
      });
    }
    if (aEnregistrer.length > 0) {
      setLignes([{ ...LIGNE_VIDE }]);
    }
  }

  async function handleEnregistrer() {
    setSaving(true);
    setError("");
    try {
      await enregistrerConsultation(rendezVous.id, { diagnostic: diagnostic || undefined, observations: observations || undefined });
      await persisterNouvellesLignes();
      onSaved("Consultation enregistrée.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleGenererOrdonnance() {
    setGenerating(true);
    setError("");
    try {
      await persisterNouvellesLignes();
      const document = await genererOrdonnance(patient.id, { rendez_vous_id: rendezVous.id });
      await telechargerDocument(document.id, document.titre);
      onSaved("Ordonnance générée et téléchargée.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  const enCours = saving || generating;

  return (
    <div className="modal-overlay" onClick={() => !enCours && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <h3>
          Consultation — {patient.prenom} {patient.nom}
        </h3>
        <p style={{ fontSize: 12.5, color: "var(--sub)", marginTop: -10, marginBottom: 16 }}>
          {formatDateLongApi(rendezVous.date_heure)} · {formatHeureApi(rendezVous.date_heure)}
        </p>

        <div className="card" style={{ background: "var(--danger-light)", border: "1px solid #FCD3D3", marginBottom: 16, padding: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--danger)" }}>🚨 Allergies : </span>
          <span style={{ fontSize: 12.5 }}>{allergies || "Aucune allergie connue."}</span>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 14 }}>{error}</div>}

        <div className="field">
          <label htmlFor="diagnostic">Diagnostic</label>
          <textarea
            id="diagnostic"
            className="input"
            rows={2}
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            disabled={enCours}
          />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="observations">Observations</label>
          <textarea
            id="observations"
            className="input"
            rows={2}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            disabled={enCours}
          />
        </div>

        {traitementsExistants.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <b style={{ fontSize: 13.5 }}>Traitements déjà prescrits pour ce RDV</b>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {traitementsExistants.map((t) => (
                <div key={t.id} className="blocage-row">
                  <div>
                    <b>{t.medicament}</b>
                    <span>{t.posologie}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <b style={{ fontSize: 13.5 }}>Prescrire un traitement</b>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {lignes.map((ligne, index) => (
              <div key={index} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                <input
                  className="input"
                  placeholder="Médicament"
                  style={{ flex: "1 1 160px" }}
                  value={ligne.medicament}
                  onChange={(e) => handleChangeLigne(index, "medicament", e.target.value)}
                  disabled={enCours}
                />
                <input
                  className="input"
                  placeholder="Posologie"
                  style={{ flex: "1 1 160px" }}
                  value={ligne.posologie}
                  onChange={(e) => handleChangeLigne(index, "posologie", e.target.value)}
                  disabled={enCours}
                />
                <input
                  type="date"
                  className="input"
                  style={{ flex: "1 1 130px" }}
                  value={ligne.date_debut}
                  onChange={(e) => handleChangeLigne(index, "date_debut", e.target.value)}
                  disabled={enCours}
                />
                <input
                  type="date"
                  className="input"
                  placeholder="Fin (optionnel)"
                  style={{ flex: "1 1 130px" }}
                  value={ligne.date_fin}
                  onChange={(e) => handleChangeLigne(index, "date_fin", e.target.value)}
                  disabled={enCours}
                />
                {lignes.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => retirerLigne(index)} disabled={enCours}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" style={{ width: "fit-content" }} onClick={ajouterLigne} disabled={enCours}>
              + Ajouter une ligne
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={handleEnregistrer} disabled={enCours}>
            {saving ? "Enregistrement…" : "Enregistrer la consultation"}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleGenererOrdonnance} disabled={enCours}>
            {generating ? "Génération…" : "Générer l'ordonnance"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={enCours}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
