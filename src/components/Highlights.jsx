const STEPS = [
  ["1", "Créer un compte", "Inscrivez-vous gratuitement en moins de 2 minutes."],
  ["2", "Choisir un médecin", "Parcourez nos spécialistes et leurs disponibilités."],
  ["3", "Choisir une date", "Sélectionnez le créneau qui vous convient."],
  ["4", "Recevoir la confirmation", "Notification instantanée par SMS et par e-mail."],
  ["5", "Consulter le médecin", "Présentez-vous à la clinique le jour J, sans attente."],
];

const NUMBERS = [
  ["10 000+", "Patients accompagnés"],
  ["25+", "Médecins spécialistes"],
  ["50 000+", "Consultations réalisées"],
  ["15+", "Années d'expérience"],
  ["98 %", "Taux de satisfaction"],
];

const WHY = [
  ["🎓", "Médecins qualifiés", "Des spécialistes diplômés des meilleures facultés, en formation continue."],
  ["🚑", "Urgences 24/7", "Un service d'urgence opérationnel jour et nuit, toute l'année."],
  ["⚙️", "Technologie moderne", "Scanner, IRM et plateau technique de dernière génération."],
  ["⚡", "Rendez-vous rapide", "Réservation en ligne en quelques clics, confirmation immédiate."],
  ["🧪", "Laboratoire performant", "Analyses fiables avec résultats disponibles en ligne, en toute sécurité."],
  ["🤝", "Accompagnement personnalisé", "Un suivi humain et attentif, du premier contact à la guérison."],
];

export function Process() {
  return (
    <section className="process">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Comment ça marche</span>
          <h2>Prendre rendez-vous en 5 étapes simples</h2>
          <p>De la création de votre compte à la consultation, tout se fait en quelques clics.</p>
        </div>
        <div className="steps reveal">
          {STEPS.map(([n, t, d], i) => (
            <FragmentStep key={n} n={n} t={t} d={d} last={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FragmentStep({ n, t, d, last }) {
  return (
    <>
      <div className="step"><div className="num">{n}</div><h4>{t}</h4><p>{d}</p></div>
      {!last && <div className="step-arrow">→</div>}
    </>
  );
}

export function Numbers() {
  return (
    <section className="numbers">
      <div className="container">
        {NUMBERS.map(([n, l]) => (
          <div className="num-item reveal" key={l}><b>{n}</b><span>{l}</span></div>
        ))}
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="why" id="apropos">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Pourquoi nous choisir</span>
          <h2>L'excellence médicale au service de chaque patient</h2>
        </div>
        <div className="grid-3">
          {WHY.map(([emo, t, d]) => (
            <div className="card why-card reveal" key={t}>
              <div className="ico">{emo}</div><h4>{t}</h4><p>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
