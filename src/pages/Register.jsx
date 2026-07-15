import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import AuthPanel from "../components/AuthPanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { roleHome } from "../utils/roles.js";
import { extractErrorMessage, extractFieldErrors } from "../utils/apiError.js";

const EMPTY_FORM = {
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  date_naissance: "",
  sexe: "",
  password: "",
  password_confirmation: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { user, loading, register } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone.replace(/\s+/g, ""),
        date_naissance: form.date_naissance,
        sexe: form.sexe || undefined,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      navigate("/patient", { replace: true });
    } catch (err) {
      const rawFieldErrors = extractFieldErrors(err);
      if (Object.keys(rawFieldErrors).length > 0) {
        const flattened = {};
        for (const [field, messages] of Object.entries(rawFieldErrors)) {
          flattened[field] = messages[0];
        }
        setFieldErrors(flattened);
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <AuthPanel
        title="Rejoignez la Clinique Croix Bleue"
        lead="Créez votre compte patient gratuit et prenez rendez-vous avec nos spécialistes en quelques minutes."
      />
      <main className="side">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Créer un compte patient</h2>
          <p className="sub">Inscription gratuite — réservée aux patients. Les comptes professionnels sont créés par l'administration.</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="form-row">
            <div className="field">
              <label>Prénom</label>
              <input
                className="input"
                type="text"
                placeholder="Votre prénom"
                value={form.prenom}
                onChange={updateField("prenom")}
                required
              />
              {fieldErrors.prenom && <p className="field-error">{fieldErrors.prenom}</p>}
            </div>
            <div className="field">
              <label>Nom</label>
              <input
                className="input"
                type="text"
                placeholder="Votre nom"
                value={form.nom}
                onChange={updateField("nom")}
                required
              />
              {fieldErrors.nom && <p className="field-error">{fieldErrors.nom}</p>}
            </div>
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input
              className="input"
              type="tel"
              placeholder="+221 7X XXX XX XX"
              value={form.telephone}
              onChange={updateField("telephone")}
              required
            />
            {fieldErrors.telephone && <p className="field-error">{fieldErrors.telephone}</p>}
          </div>
          <div className="field">
            <label>Adresse e-mail</label>
            <input
              className="input"
              type="email"
              placeholder="exemple@email.com"
              value={form.email}
              onChange={updateField("email")}
              required
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>
          <div className="form-row">
            <div className="field">
              <label>Date de naissance</label>
              <input
                className="input"
                type="date"
                value={form.date_naissance}
                onChange={updateField("date_naissance")}
                required
              />
              {fieldErrors.date_naissance && <p className="field-error">{fieldErrors.date_naissance}</p>}
            </div>
            <div className="field">
              <label>Sexe</label>
              <select className="input" value={form.sexe} onChange={updateField("sexe")}>
                <option value="" disabled>Sélectionner</option>
                <option value="F">Femme</option>
                <option value="M">Homme</option>
              </select>
              {fieldErrors.sexe && <p className="field-error">{fieldErrors.sexe}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Mot de passe</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={updateField("password")}
                required
              />
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>
            <div className="field">
              <label>Confirmer</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••••"
                value={form.password_confirmation}
                onChange={updateField("password_confirmation")}
                required
              />
            </div>
          </div>

          <div className="row-between" style={{ marginTop: 2 }}>
            <label className="check">
              <input type="checkbox" required />{" "}
              <span>J'accepte les <a className="link" href="#">conditions d'utilisation</a> et la <a className="link" href="#">politique de confidentialité</a></span>
            </label>
          </div>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Inscription en cours…" : "Créer mon compte →"}
          </button>

          <div className="divider">ou</div>

          <p className="alt">Déjà inscrit ? <Link className="link" to="/connexion">Se connecter</Link></p>
          <Link className="back" to="/">← Retour au site de la clinique</Link>
        </form>
      </main>
    </div>
  );
}
