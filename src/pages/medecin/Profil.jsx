import { useEffect, useState } from "react";
import Topbar from "../../components/medecin/Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getProfil, updateProfil } from "../../services/profil.js";
import { updateBioMedecin } from "../../services/medecin.js";
import { extractErrorMessage, extractFieldErrors } from "../../utils/apiError.js";

const CHAMPS_VIDES = { prenom: "", nom: "", email: "", telephone: "", date_naissance: "", sexe: "" };

export default function MedecinProfil() {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(CHAMPS_VIDES);
  const [medecin, setMedecin] = useState(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getProfil()
      .then((data) => {
        setForm({
          prenom: data.prenom ?? "",
          nom: data.nom ?? "",
          email: data.email ?? "",
          telephone: data.telephone ?? "",
          date_naissance: data.date_naissance ? data.date_naissance.slice(0, 10) : "",
          sexe: data.sexe ?? "",
        });
        setMedecin(data.medecin ?? null);
        setBio(data.medecin?.bio ?? "");
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const updated = await updateProfil({ ...form, sexe: form.sexe || null });
      updateUser(updated);
      showToast("Profil mis à jour avec succès.", "success");
    } catch (err) {
      setError(extractErrorMessage(err));
      setFieldErrors(extractFieldErrors(err));
      showToast("Impossible d'enregistrer le profil.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitBio(e) {
    e.preventDefault();
    setSavingBio(true);
    try {
      const updated = await updateBioMedecin(bio);
      setMedecin(updated);
      showToast("Biographie mise à jour.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSavingBio(false);
    }
  }

  return (
    <>
      <Topbar title="Mon profil" subtitle="Vos informations personnelles et professionnelles." />

      {loading ? (
        <div className="card">
          <p className="empty-state">Chargement du profil…</p>
        </div>
      ) : (
        <div className="grid-2">
          <div className="card">
            <h3>👤 Informations personnelles</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {error && <div className="alert-error">{error}</div>}
              <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="field">
                  <label htmlFor="prenom">Prénom</label>
                  <input id="prenom" className="input" value={form.prenom} onChange={handleChange("prenom")} />
                  {fieldErrors.prenom && <span className="field-error">{fieldErrors.prenom[0]}</span>}
                </div>
                <div className="field">
                  <label htmlFor="nom">Nom</label>
                  <input id="nom" className="input" value={form.nom} onChange={handleChange("nom")} />
                  {fieldErrors.nom && <span className="field-error">{fieldErrors.nom[0]}</span>}
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" className="input" value={form.email} onChange={handleChange("email")} />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}
              </div>
              <div className="field">
                <label htmlFor="telephone">Téléphone</label>
                <input
                  id="telephone"
                  className="input"
                  value={form.telephone}
                  onChange={handleChange("telephone")}
                  placeholder="+221771234567"
                />
                {fieldErrors.telephone && <span className="field-error">{fieldErrors.telephone[0]}</span>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "fit-content" }}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card">
              <h3>🩺 Informations professionnelles</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--sub)" }}>Spécialité</span>
                  <b>{medecin?.specialite?.nom ?? "—"}</b>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--sub)" }}>Titre</span>
                  <b>{medecin?.titre ?? "—"}</b>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--sub)" }}>Expérience</span>
                  <b>{medecin?.annees_experience != null ? `${medecin.annees_experience} ans` : "—"}</b>
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--sub)", marginBottom: 14 }}>
                Spécialité et titre sont gérés par l'administration de la clinique.
              </p>
              <form onSubmit={handleSubmitBio}>
                <div className="field">
                  <label htmlFor="bio">Biographie</label>
                  <textarea
                    id="bio"
                    className="input"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={2000}
                    placeholder="Décrivez votre parcours, vos domaines d'expertise…"
                  />
                </div>
                <button type="submit" className="btn btn-outline btn-sm" disabled={savingBio} style={{ marginTop: 10 }}>
                  {savingBio ? "Enregistrement…" : "Enregistrer la biographie"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
