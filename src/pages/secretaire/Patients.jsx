import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Topbar from "../../components/secretaire/Topbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getPatients, creerPatient } from "../../services/secretairePatients.js";
import { extractErrorMessage, extractFieldErrors } from "../../utils/apiError.js";

const CHAMPS_VIDES = { prenom: "", nom: "", telephone: "", email: "", date_naissance: "", sexe: "" };

function initiales(patient) {
  const a = patient.prenom?.charAt(0) ?? "";
  const b = patient.nom?.charAt(0) ?? "";
  return (a + b).toUpperCase();
}

function formatDateCourte(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function SecretairePatients() {
  const location = useLocation();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(Boolean(location.state?.prefillPrenom));
  const [form, setForm] = useState({ ...CHAMPS_VIDES, prenom: location.state?.prefillPrenom ?? "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [dernierPatientCree, setDernierPatientCree] = useState(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      getPatients({ q: query, page })
        .then(setPatients)
        .catch((err) => setError(extractErrorMessage(err)));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, page]);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    try {
      const patient = await creerPatient({ ...form, sexe: form.sexe || undefined });
      showToast(`${patient.prenom} ${patient.nom} enregistré(e) avec succès.`, "success");
      setDernierPatientCree(patient);
      setForm(CHAMPS_VIDES);
      setShowForm(false);
      setQuery("");
      setPage(1);
      getPatients({ page: 1 }).then(setPatients).catch(() => {});
    } catch (err) {
      setFormError(extractErrorMessage(err));
      setFieldErrors(extractFieldErrors(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Patients" subtitle={patients ? `${patients.total} patients enregistrés à la clinique.` : ""} />

      {dernierPatientCree && (
        <div className="card" style={{ background: "var(--blue-light)", border: "1px solid #DCE8FF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13.5 }}>
              <b>
                {dernierPatientCree.prenom} {dernierPatientCree.nom}
              </b>{" "}
              vient d'être enregistré(e).
            </span>
            <Link
              className="btn btn-primary btn-sm"
              to="/secretaire/nouveau-rdv"
              state={{ patient: dernierPatientCree }}
            >
              Créer un RDV maintenant →
            </Link>
          </div>
        </div>
      )}

      <div className="searchbar">
        <input
          type="text"
          className="input"
          placeholder="🔍 Rechercher un patient par nom ou téléphone…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          + Nouveau patient
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>🧑🏾‍🤝‍🧑🏾 Enregistrer un nouveau patient</h3>
          <form onSubmit={handleSubmit}>
            {formError && <div className="alert-error" style={{ marginBottom: 14 }}>{formError}</div>}
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="field">
                <label htmlFor="prenom">Prénom</label>
                <input id="prenom" className="input" value={form.prenom} onChange={handleChange("prenom")} required />
                {fieldErrors.prenom && <span className="field-error">{fieldErrors.prenom[0]}</span>}
              </div>
              <div className="field">
                <label htmlFor="nom">Nom</label>
                <input id="nom" className="input" value={form.nom} onChange={handleChange("nom")} required />
                {fieldErrors.nom && <span className="field-error">{fieldErrors.nom[0]}</span>}
              </div>
              <div className="field">
                <label htmlFor="telephone">Téléphone</label>
                <input
                  id="telephone"
                  className="input"
                  placeholder="+221771234567"
                  value={form.telephone}
                  onChange={handleChange("telephone")}
                  required
                />
                {fieldErrors.telephone && <span className="field-error">{fieldErrors.telephone[0]}</span>}
              </div>
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" className="input" value={form.email} onChange={handleChange("email")} required />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}
              </div>
              <div className="field">
                <label htmlFor="date_naissance">Date de naissance</label>
                <input
                  id="date_naissance"
                  type="date"
                  className="input"
                  value={form.date_naissance}
                  onChange={handleChange("date_naissance")}
                  required
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
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer le patient"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={saving}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <h3>
          Patients enregistrés {patients && <span className="badge b-blue">{patients.total} au total</span>}
        </h3>

        {!patients && !error && <p className="empty-state">Chargement…</p>}
        {patients && patients.data.length === 0 && <p className="empty-state">Aucun patient ne correspond à cette recherche.</p>}

        {patients && patients.data.length > 0 && (
          <>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Téléphone</th>
                  <th>Dernière visite</th>
                  <th>Prochain RDV</th>
                </tr>
              </thead>
              <tbody>
                {patients.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="cell">
                        <div className="avatar">{initiales(p)}</div>
                        <div>
                          <b>
                            {p.prenom} {p.nom}
                          </b>
                          <span>{p.age != null ? `${p.age} ans` : ""}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.telephone}</td>
                    <td>{formatDateCourte(p.derniere_visite) ?? "Nouveau"}</td>
                    <td>{formatDateCourte(p.prochain_rdv) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {patients.last_page > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹ Précédent
                </button>
                <span>
                  Page {patients.current_page} / {patients.last_page}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={page >= patients.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
