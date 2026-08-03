import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./../styles/auth.css";
import AuthPanel from "../components/AuthPanel.jsx";
import { definirMotDePasse } from "../services/definirMotDePasse.js";
import { extractErrorMessage } from "../utils/apiError.js";

export default function DefinirMotDePasse() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await definirMotDePasse({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSucces(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="auth">
        <AuthPanel
          title="Lien invalide"
          lead="Ce lien de définition de mot de passe est incomplet ou a été modifié."
        />
        <main className="side">
          <div className="form-card">
            <h2>Lien invalide</h2>
            <p className="sub">Merci de contacter le secrétariat de la clinique pour recevoir un nouveau lien.</p>
            <Link className="back" to="/connexion">
              ← Retour à la connexion
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (succes) {
    return (
      <div className="auth">
        <AuthPanel
          title="Mot de passe défini 🎉"
          lead="Votre compte est prêt. Vous pouvez maintenant vous connecter à votre espace patient."
        />
        <main className="side">
          <div className="form-card">
            <h2>C'est fait !</h2>
            <p className="sub">Votre mot de passe a bien été enregistré.</p>
            <Link className="btn" to="/connexion">
              Se connecter →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth">
      <AuthPanel
        title="Bienvenue à la Clinique Croix Bleue"
        lead="Définissez votre mot de passe pour accéder à votre espace patient et gérer vos rendez-vous."
      />
      <main className="side">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Définir mon mot de passe</h2>
          <p className="sub">Compte : {email}</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label>Nouveau mot de passe</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="field">
            <label>Confirmer le mot de passe</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Enregistrement…" : "Définir mon mot de passe →"}
          </button>

          <Link className="back" to="/connexion">
            ← Retour à la connexion
          </Link>
        </form>
      </main>
    </div>
  );
}
