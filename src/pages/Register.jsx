import { Link } from "react-router-dom";
import "../styles/auth.css";
import AuthPanel from "../components/AuthPanel.jsx";

export default function Register() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO : appeler l'API Laravel — POST /api/register (rôle patient uniquement)
    alert("Inscription (démo) — à brancher sur l'API Laravel");
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

          <div className="form-row">
            <div className="field">
              <label>Prénom</label>
              <input className="input" type="text" placeholder="Votre prénom" required />
            </div>
            <div className="field">
              <label>Nom</label>
              <input className="input" type="text" placeholder="Votre nom" required />
            </div>
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input className="input" type="tel" placeholder="+221 7X XXX XX XX" required />
          </div>
          <div className="field">
            <label>Adresse e-mail</label>
            <input className="input" type="email" placeholder="exemple@email.com" required />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Date de naissance</label>
              <input className="input" type="date" required />
            </div>
            <div className="field">
              <label>Sexe</label>
              <select className="input" defaultValue="">
                <option value="" disabled>Sélectionner</option>
                <option>Femme</option>
                <option>Homme</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Mot de passe</label>
              <input className="input" type="password" placeholder="••••••••••" required />
            </div>
            <div className="field">
              <label>Confirmer</label>
              <input className="input" type="password" placeholder="••••••••••" required />
            </div>
          </div>

          <div className="row-between" style={{ marginTop: 2 }}>
            <label className="check">
              <input type="checkbox" required />{" "}
              <span>J'accepte les <a className="link" href="#">conditions d'utilisation</a> et la <a className="link" href="#">politique de confidentialité</a></span>
            </label>
          </div>

          <button className="btn" type="submit">Créer mon compte →</button>

          <div className="divider">ou</div>

          <p className="alt">Déjà inscrit ? <Link className="link" to="/connexion">Se connecter</Link></p>
          <Link className="back" to="/">← Retour au site de la clinique</Link>
        </form>
      </main>
    </div>
  );
}
