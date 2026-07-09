export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO : appeler l'API Laravel — POST /api/contact
    alert("Message envoyé ! (démo)");
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Contact</span>
          <h2>Nous sommes à votre écoute</h2>
        </div>
        <div className="contact-grid">
          <form className="form-card reveal" onSubmit={handleSubmit}>
            <div className="form-row">
              <input className="input" type="text" placeholder="Nom complet" required />
              <input className="input" type="tel" placeholder="Téléphone" />
            </div>
            <div className="form-row">
              <input className="input" type="email" placeholder="Adresse e-mail" required />
              <input className="input" type="text" placeholder="Sujet" />
            </div>
            <textarea placeholder="Votre message…" required />
            <button className="btn btn-primary" type="submit">Envoyer le message</button>
          </form>
          <div className="reveal">
            <div className="map ph"><span className="emo">🗺️</span><span>Carte Google Maps — Ouakam, Dakar</span></div>
            <div className="info-list">
              <div className="info-item"><div className="ico">📍</div><div><b>Adresse</b><span>Route de l'Aéroport, Ouakam — Dakar, Sénégal</span></div></div>
              <div className="info-item"><div className="ico">📞</div><div><b>Téléphone / WhatsApp</b><span>+221 33 800 00 00 · +221 77 000 00 00</span></div></div>
              <div className="info-item"><div className="ico">✉️</div><div><b>E-mail</b><span>contact@croixbleue.sn</span></div></div>
              <div className="info-item"><div className="ico">🌐</div><div><b>Réseaux sociaux</b><span>Facebook · Instagram · LinkedIn</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
