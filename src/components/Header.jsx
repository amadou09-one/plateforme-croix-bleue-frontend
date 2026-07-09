import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      <div className="topbar">
        <div className="container">
          <ul>
            <li><a href="tel:+221338000000">📞 +221 33 800 00 00</a></li>
            <li>🚨 Urgences 24/7</li>
            <li><a href="mailto:contact@croixbleue.sn">✉️ contact@croixbleue.sn</a></li>
            <li>📍 Ouakam, Dakar — Sénégal</li>
          </ul>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">LinkedIn</a></li>
            <li><a href="#">WhatsApp</a></li>
            <li className="lang">🌐 FR · EN</li>
          </ul>
        </div>
      </div>
      <nav className="navbar">
        <div className="container">
          <Link className="logo" to="/">
            <div className="logo-mark">✚</div>
            <div><b>Clinique Croix Bleue</b><span>Dakar — Sénégal</span></div>
          </Link>
          <div className="nav-menu">
            <a href="#" className="active">Accueil</a>
            <a href="#apropos">À propos</a>
            <a href="#medecins">Médecins</a>
            <a href="#services">Services</a>
            <a href="#actualites">Actualités</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-cta">
            <Link className="btn btn-outline" to="/connexion">Connexion</Link>
            <Link className="btn btn-primary" to="/connexion">Prendre rendez-vous</Link>
          </div>
        </div>
      </nav>
    </>
  );
}
