import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import AuthPanel from "../components/AuthPanel.jsx";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO : appeler l'API Laravel — POST /api/login (Sanctum)
    // puis rediriger selon le rôle : /patient, /medecin, /secretaire, /admin
    alert("Connexion (démo) — à brancher sur l'API Laravel");
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

          <div className="field">
            <label>Adresse e-mail</label>
            <input className="input" type="email" placeholder="exemple@email.com" required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••••" required />
          </div>

          <div className="row-between">
            <label className="check">
              <input type="checkbox" /> <span>Se souvenir de moi</span>
            </label>
            <a className="link" href="#">Mot de passe oublié ?</a>
          </div>

          <button className="btn" type="submit">Se connecter →</button>

          <div className="divider">ou</div>

          <p className="alt">Pas encore de compte ? <Link className="link" to="/inscription">Créer un compte patient</Link></p>
          <Link className="back" to="/">← Retour au site de la clinique</Link>
        </form>
      </main>
    </div>
  );
}
