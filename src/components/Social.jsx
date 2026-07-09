const TESTIMONIALS = [
  { stars: "★★★★★", text: "« La prise de rendez-vous en ligne est très simple et je n'ai presque pas attendu. Le Dr Ndiaye a été d'une grande écoute. »", emo: "👩🏾", name: "Awa Cissé", job: "Enseignante, Dakar" },
  { stars: "★★★★★", text: "« Ma fille a été prise en charge aux urgences en pleine nuit. Équipe réactive, rassurante et très professionnelle. Merci ! »", emo: "👨🏾", name: "Ousmane Gueye", job: "Entrepreneur, Rufisque" },
  { stars: "★★★★☆", text: "« Les résultats du laboratoire sont disponibles en ligne, c'est un vrai gain de temps. Une clinique moderne comme on en rêve. »", emo: "👩🏾", name: "Mariama Ba", job: "Comptable, Pikine" },
];

const PARTNERS = [
  { img: "/logos/axa.svg", name: "AXA Assurances Sénégal", type: "Assurance santé" },
  { img: "/logos/askia.png", name: "Askia Assurances", type: "Assurance santé" },
  { img: "/logos/sunu.png", name: "SUNU Assurances", type: "Assurance santé" },
  { img: "/logos/reliance.svg", name: "Reliance Health", type: "Assurance santé" },
  { img: "/logos/nsia.png", name: "NSIA Assurances", type: "Assurance santé" },
  { initials: "AL", name: "Allianz Sénégal", type: "Assurance santé" },
  { initials: "IPM", name: "IPM interentreprises", type: "Prévoyance maladie" },
  { img: "/logos/cmu.png", name: "Couverture Maladie Universelle", type: "Programme national" },
];

const NEWS = [
  { emo: "🩺", ph: "Photo : campagne de dépistage", tag: "Prévention", meta: "12 juin 2026 · Dr A. Ndiaye", title: "Campagne de dépistage gratuit du diabète et de l'hypertension", text: "Du 20 au 27 juin, la clinique organise une semaine de dépistage gratuit ouverte à tous." },
  { emo: "🖥️", ph: "Photo : nouvelle IRM", tag: "Équipement", meta: "28 mai 2026 · Direction", title: "Une nouvelle IRM 1,5 T rejoint notre service d'imagerie", text: "Des examens plus rapides et plus précis grâce à un équipement de dernière génération." },
  { emo: "👶", ph: "Photo : consultation pédiatrique", tag: "Santé", meta: "10 mai 2026 · Dr M. Sarr", title: "Vaccination des nourrissons : le calendrier 2026 expliqué", text: "Nos pédiatres font le point sur les vaccins essentiels de la première année." },
];

export function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Témoignages</span>
          <h2>Ils nous font confiance</h2>
        </div>
        <div className="grid-3">
          {TESTIMONIALS.map((t) => (
            <div className="card tst reveal" key={t.name}>
              <span className="stars">{t.stars}</span>
              <p>{t.text}</p>
              <div className="tst-author">
                <div className="avatar">{t.emo}</div>
                <div><b>{t.name}</b><span>{t.job}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners() {
  return (
    <section className="partners">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Tiers-payant</span>
          <h2>Nos partenaires assurances &amp; IPM</h2>
          <p>Nous acceptons les principales assurances santé et Institutions de Prévoyance Maladie du Sénégal.</p>
        </div>
        <div className="partners-grid reveal">
          {PARTNERS.map((p) => (
            <div className="partner" key={p.name}>
              {p.img
                ? <div className="plogo-img"><img src={p.img} alt={p.name} /></div>
                : <div className="plogo">{p.initials}</div>}
              <b>{p.name}</b><span>{p.type}</span>
            </div>
          ))}
        </div>
        <p className="partners-note">
          Votre assurance n'est pas dans la liste ?{" "}
          <a href="#contact" style={{ color: "var(--blue)", fontWeight: 600 }}>Contactez-nous</a> pour vérifier votre prise en charge.
        </p>
      </div>
    </section>
  );
}

export function News() {
  return (
    <section className="news" id="actualites">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Actualités</span>
          <h2>Les dernières nouvelles de la clinique</h2>
        </div>
        <div className="grid-3">
          {NEWS.map((n) => (
            <div className="card news-card reveal" key={n.title}>
              <div className="news-photo ph"><span className="emo">{n.emo}</span><span>{n.ph}</span></div>
              <div className="news-body">
                <div className="news-meta"><span className="news-tag">{n.tag}</span><span>{n.meta}</span></div>
                <h4>{n.title}</h4>
                <p>{n.text}</p>
                <a href="#">Lire plus →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
