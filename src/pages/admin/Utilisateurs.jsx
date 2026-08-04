import { useEffect, useState } from "react";
import Topbar from "../../components/admin/Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getUtilisateurs, creerUtilisateur, modifierUtilisateur, desactiverUtilisateur } from "../../services/adminUtilisateurs.js";
import { getSpecialites } from "../../services/rendezvous.js";
import { extractErrorMessage, extractFieldErrors } from "../../utils/apiError.js";

const ONGLETS = [
  { key: "", label: "Tous" },
  { key: "medecin", label: "Médecins" },
  { key: "secretaire", label: "Secrétaires" },
  { key: "patient", label: "Patients" },
  { key: "admin", label: "Admins" },
];

const ROLE_BADGE = {
  medecin: { label: "Médecin", cls: "b-blue" },
  secretaire: { label: "Secrétaire", cls: "b-warn" },
  patient: { label: "Patient", cls: "b-gray" },
  admin: { label: "Admin", cls: "b-green" },
};

const ROLE_AVATAR = { medecin: "🩺", secretaire: "💼", patient: "🧑🏾", admin: "🧑🏾‍💻" };

const CHAMPS_VIDES = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  role: "patient",
  date_naissance: "",
  sexe: "",
  specialite_id: "",
  titre: "",
  annees_experience: "",
  est_actif: true,
};

function sousTitre(u) {
  if (u.role === "medecin") return u.medecin?.specialite?.nom ?? "Médecin";
  if (u.role === "secretaire") return "Secrétariat";
  if (u.role === "admin") return "Administration";
  return "Patient";
}

function utilisateurVersFormulaire(u) {
  return {
    prenom: u.prenom,
    nom: u.nom,
    email: u.email,
    telephone: u.telephone,
    role: u.role,
    date_naissance: u.date_naissance ? u.date_naissance.slice(0, 10) : "",
    sexe: u.sexe ?? "",
    specialite_id: u.medecin?.specialite_id ?? "",
    titre: u.medecin?.titre ?? "",
    annees_experience: u.medecin?.annees_experience ?? "",
    est_actif: u.est_actif,
  };
}

export default function AdminUtilisateurs() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [utilisateurs, setUtilisateurs] = useState(null);
  const [error, setError] = useState("");
  const [specialites, setSpecialites] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(CHAMPS_VIDES);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getSpecialites().then(setSpecialites).catch(() => {});
  }, []);

  function recharger() {
    return getUtilisateurs({ role: activeTab, recherche: query, page })
      .then(setUtilisateurs)
      .catch((err) => setError(extractErrorMessage(err)));
  }

  useEffect(() => {
    const handle = setTimeout(recharger, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, query, page]);

  function ouvrirCreation() {
    setEditingUser(null);
    setForm(CHAMPS_VIDES);
    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  }

  function ouvrirModification(u) {
    setEditingUser(u);
    setForm(utilisateurVersFormulaire(u));
    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  }

  function handleChange(field) {
    return (e) => {
      const value = field === "est_actif" ? e.target.value === "actif" : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    try {
      if (editingUser) {
        await modifierUtilisateur(editingUser.id, form);
        showToast("Utilisateur mis à jour.", "success");
      } else {
        const { est_actif, ...payload } = form;
        await creerUtilisateur(payload);
        showToast("Compte créé avec succès. Un e-mail a été envoyé pour définir le mot de passe.", "success");
      }
      setShowModal(false);
      recharger();
    } catch (err) {
      setFormError(extractErrorMessage(err));
      setFieldErrors(extractFieldErrors(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActif(u) {
    setTogglingId(u.id);
    setError("");
    try {
      if (u.est_actif) {
        await desactiverUtilisateur(u.id);
        showToast(`${u.prenom} ${u.nom} désactivé(e).`, "success");
      } else {
        await modifierUtilisateur(u.id, { ...utilisateurVersFormulaire(u), est_actif: true });
        showToast(`${u.prenom} ${u.nom} réactivé(e).`, "success");
      }
      recharger();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <Topbar
        title="Gestion des utilisateurs"
        subtitle="Créez et gérez les comptes médecins, secrétaires et patients."
        actions={
          <button type="button" className="btn btn-primary" onClick={ouvrirCreation}>
            + Nouvel utilisateur
          </button>
        }
      />

      <div className="tabs">
        {ONGLETS.map((o) => (
          <div
            key={o.key}
            className={`tab${activeTab === o.key ? " active" : ""}`}
            onClick={() => {
              setActiveTab(o.key);
              setPage(1);
            }}
          >
            {o.label}
          </div>
        ))}
      </div>

      <div className="searchbar">
        <input
          type="text"
          className="input"
          placeholder="🔍 Rechercher un utilisateur par nom ou e-mail…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <h3>
          Utilisateurs {utilisateurs && <span className="badge b-blue">{utilisateurs.total} comptes</span>}
        </h3>

        {!utilisateurs && !error && <p className="empty-state">Chargement…</p>}
        {utilisateurs && utilisateurs.data.length === 0 && <p className="empty-state">Aucun utilisateur ne correspond à cette recherche.</p>}

        {utilisateurs && utilisateurs.data.length > 0 && (
          <>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>E-mail</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.data.map((u) => {
                  const badge = ROLE_BADGE[u.role] ?? { label: u.role, cls: "b-gray" };
                  const estMoi = u.id === user?.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="cell">
                          <div className="avatar">{ROLE_AVATAR[u.role] ?? "🧑🏾"}</div>
                          <div>
                            <b>
                              {u.prenom} {u.nom}
                            </b>
                            <span>{sousTitre(u)}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.est_actif ? "b-green" : "b-red"}`}>{u.est_actif ? "Actif" : "Inactif"}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => ouvrirModification(u)}>
                            Modifier
                          </button>
                          {!estMoi && (
                            <button
                              type="button"
                              className={`btn btn-sm ${u.est_actif ? "btn-danger" : "btn-green"}`}
                              disabled={togglingId === u.id}
                              onClick={() => handleToggleActif(u)}
                            >
                              {togglingId === u.id ? "…" : u.est_actif ? "Désactiver" : "Réactiver"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {utilisateurs.last_page > 1 && (
              <div className="pagination">
                <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ‹ Précédent
                </button>
                <span>
                  Page {utilisateurs.current_page} / {utilisateurs.last_page}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={page >= utilisateurs.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h3>
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="alert-error" style={{ marginBottom: 14 }}>
                  {formError}
                </div>
              )}

              <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
                <div className="field">
                  <label htmlFor="role">Rôle</label>
                  <select id="role" className="input" value={form.role} onChange={handleChange("role")}>
                    <option value="patient">Patient</option>
                    <option value="medecin">Médecin</option>
                    <option value="secretaire">Secrétaire</option>
                    <option value="admin">Administrateur</option>
                  </select>
                  {fieldErrors.role && <span className="field-error">{fieldErrors.role[0]}</span>}
                </div>
                {editingUser && (
                  <div className="field">
                    <label htmlFor="est_actif">Statut du compte</label>
                    <select id="est_actif" className="input" value={form.est_actif ? "actif" : "inactif"} onChange={handleChange("est_actif")}>
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>
                )}
              </div>

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
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" className="input" value={form.email} onChange={handleChange("email")} required />
                  {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}
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
                  <label htmlFor="date_naissance">Date de naissance</label>
                  <input id="date_naissance" type="date" className="input" value={form.date_naissance} onChange={handleChange("date_naissance")} />
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

              {form.role === "medecin" && (
                <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 4 }}>
                  <div className="field">
                    <label htmlFor="specialite_id">Spécialité</label>
                    <select id="specialite_id" className="input" value={form.specialite_id} onChange={handleChange("specialite_id")} required>
                      <option value="">Choisir…</option>
                      {specialites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nom}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.specialite_id && <span className="field-error">{fieldErrors.specialite_id[0]}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="titre">Titre</label>
                    <input id="titre" className="input" placeholder="Docteur en médecine" value={form.titre} onChange={handleChange("titre")} />
                    {fieldErrors.titre && <span className="field-error">{fieldErrors.titre[0]}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="annees_experience">Années d'expérience</label>
                    <input
                      id="annees_experience"
                      type="number"
                      min="0"
                      className="input"
                      value={form.annees_experience}
                      onChange={handleChange("annees_experience")}
                      required
                    />
                    {fieldErrors.annees_experience && <span className="field-error">{fieldErrors.annees_experience[0]}</span>}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Enregistrement…" : editingUser ? "Enregistrer les modifications" : "Créer le compte"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={saving}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
