import { Link } from "react-router-dom";

const STATS = [
  ["25+", "Médecins spécialistes"],
  ["15+", "Services médicaux"],
  ["10 000+", "Patients accompagnés"],
  ["24/7", "Urgences"],
];

export default function Hero() {
  return (
    <header className="hero">
      <div className="container">
        <div>
          <span className="badge">🏥 Clinique privée de référence au Sénégal</span>
          <h1>Votre santé mérite une prise en charge <em>d'excellence</em>.</h1>
          <p className="lead">
            Prenez rendez-vous en ligne avec nos spécialistes et bénéficiez
            d'un accompagnement médical personnalisé.
          </p>
          <div className="hero-btns">
            <Link className="btn btn-primary" to="/connexion">Prendre rendez-vous →</Link>
            <a className="btn btn-outline" href="#services">Découvrir nos services</a>
          </div>
          <div className="hero-stats">
            {STATS.map(([n, l]) => (
              <div className="stat" key={l}><b>{n}</b><span>{l}</span></div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo ph">
            <span className="emo">🧑🏾‍⚕️</span>
            <span>Photo : médecin sénégalais avec un patient<br />salle de consultation moderne</span>
          </div>
          <div className="float-card fc-1"><div className="ico">😊</div><div><b>Patient satisfait</b><span>98 % de satisfaction</span></div></div>
          <div className="float-card fc-2"><div className="ico">🗓</div><div><b>Disponibilité</b><span>Créneaux dès aujourd'hui</span></div></div>
          <div className="float-card fc-3"><div className="ico">🩺</div><div><b>Consultation</b><span>Dr Ndiaye · 15 h 30</span></div></div>
          <div className="float-card fc-4"><div className="ico">🚑</div><div><b>Urgence 24/7</b><span>Prise en charge immédiate</span></div></div>
        </div>
      </div>
    </header>
  );
}
