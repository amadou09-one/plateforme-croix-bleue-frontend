import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Link className="logo" to="/">
              <div className="logo-mark">✚</div>
              <div><b>Clinique Croix Bleue</b><span>Dakar — Sénégal</span></div>
            </Link>
            <p className="footer-desc">
              Clinique privée de référence à Dakar, nous plaçons l'humain au cœur des soins
              avec une équipe de spécialistes et un plateau technique moderne.
            </p>
            <div className="socials">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">◎</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="WhatsApp">✆</a>
            </div>
          </div>
          <div>
            <h5>Liens rapides</h5>
            <ul>
              <li><a href="#">Accueil</a></li>
              <li><a href="#apropos">À propos</a></li>
              <li><a href="#medecins">Nos médecins</a></li>
              <li><a href="#actualites">Actualités</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5>Nos services</h5>
            <ul>
              <li><a href="#services">Cardiologie</a></li>
              <li><a href="#services">Pédiatrie</a></li>
              <li><a href="#services">Gynécologie</a></li>
              <li><a href="#services">Imagerie médicale</a></li>
              <li><a href="#services">Laboratoire</a></li>
              <li><a href="#services">Urgences 24/7</a></li>
            </ul>
          </div>
          <div>
            <h5>Newsletter</h5>
            <p style={{ fontSize: 14, marginBottom: 16 }}>
              Recevez nos conseils santé et les actualités de la clinique.
            </p>
            <div className="newsletter">
              <input className="input" type="email" placeholder="Votre adresse e-mail" />
              <button className="btn btn-primary" type="button">S'abonner</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Clinique Croix Bleue — Tous droits réservés.</span>
          <ul>
            <li><a href="#">Mentions légales</a></li>
            <li><a href="#">Politique de confidentialité</a></li>
            <li><a href="#">Conditions d'utilisation</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
