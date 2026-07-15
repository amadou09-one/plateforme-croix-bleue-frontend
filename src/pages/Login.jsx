import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import AuthPanel from "../components/AuthPanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { roleHome } from "../utils/roles.js";
import { extractErrorMessage } from "../utils/apiError.js";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(roleHome(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <AuthPanel
        title="Bon retour parmi nous 👋"
        lead="Connectez-vous pour gérer vos rendez-vous et accéder à votre espace personnel sécurisé."
      />
      <main className="side">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Connexion</h2>
          <p className="sub">Accédez à votre espace — patient, médecin, secrétaire ou administrateur.</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label>Adresse e-mail</label>
            <input
              className="input"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="row-between">
            <label className="check">
              <input type="checkbox" /> <span>Se souvenir de moi</span>
            </label>
            <a className="link" href="#">Mot de passe oublié ?</a>
          </div>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Connexion en cours…" : "Se connecter →"}
          </button>

          <div className="divider">ou</div>

          <p className="alt">Pas encore de compte ? <Link className="link" to="/inscription">Créer un compte patient</Link></p>
          <Link className="back" to="/">← Retour au site de la clinique</Link>
        </form>
      </main>
    </div>
  );
}
