import { useEffect, useState } from "react";
import Topbar from "../../components/patient/Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getProfil, updateProfil } from "../../services/profil.js";
import { extractErrorMessage, extractFieldErrors } from "../../utils/apiError.js";

const CHAMPS_VIDES = { prenom: "", nom: "", email: "", telephone: "", date_naissance: "", sexe: "" };

export default function PatientProfile() {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(CHAMPS_VIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getProfil()
      .then((data) =>
        setForm({
          prenom: data.prenom ?? "",
          nom: data.nom ?? "",
          email: data.email ?? "",
          telephone: data.telephone ?? "",
          date_naissance: data.date_naissance ? data.date_naissance.slice(0, 10) : "",
          sexe: data.sexe ?? "",
        })
      )
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

  return (
    <>
      <Topbar title="Mon profil" subtitle="Vos informations personnelles." />
      <div className="card" style={{ maxWidth: 560 }}>
        {loading ? (
          <p className="empty-state">Chargement du profil…</p>
        ) : (
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
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="field">
                <label htmlFor="date_naissance">Date de naissance</label>
                <input
                  id="date_naissance"
                  type="date"
                  className="input"
                  value={form.date_naissance}
                  onChange={handleChange("date_naissance")}
                />
                {fieldErrors.date_naissance && <span className="field-error">{fieldErrors.date_naissance[0]}</span>}
              </div>
              <div className="field">
                <label htmlFor="sexe">Sexe</label>
                <select id="sexe" className="input" value={form.sexe} onChange={handleChange("sexe")}>
                  <option value="">Non précisé</option>
                  <option value="F">Femme</option>
                  <option value="M">Homme</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "fit-content" }}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
