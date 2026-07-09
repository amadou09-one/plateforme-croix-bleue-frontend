const SERVICES = [
  ["🩺", "Médecine générale", "Consultations, suivi médical et prévention pour toute la famille."],
  ["❤️", "Cardiologie", "Dépistage, ECG, échographie cardiaque et suivi des pathologies du cœur."],
  ["👶", "Pédiatrie", "Soins et suivi de croissance des nourrissons, enfants et adolescents."],
  ["🤰", "Gynécologie", "Suivi gynécologique, obstétrique et accompagnement de la maternité."],
  ["🧴", "Dermatologie", "Diagnostic et traitement des affections de la peau, cheveux et ongles."],
  ["🩻", "Radiologie", "Radiographie numérique de dernière génération, résultats rapides."],
  ["🖥️", "Imagerie médicale", "Scanner, IRM et échographie pour un diagnostic précis."],
  ["👂", "ORL", "Troubles de l'oreille, du nez et de la gorge, chez l'adulte et l'enfant."],
  ["🦷", "Dentisterie", "Soins dentaires, orthodontie et chirurgie bucco-dentaire."],
  ["🧪", "Laboratoire", "Analyses médicales complètes avec résultats en ligne sécurisés."],
  ["🧠", "Neurologie", "Prise en charge des affections du système nerveux et céphalées."],
  ["🚑", "Urgences 24/7", "Service d'urgence opérationnel jour et nuit, 7 jours sur 7."],
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Nos spécialités</span>
          <h2>Des soins d'excellence dans chaque domaine</h2>
          <p>Une équipe pluridisciplinaire et un plateau technique moderne pour répondre à tous vos besoins de santé.</p>
        </div>
        <div className="grid-4">
          {SERVICES.map(([emo, name, desc]) => (
            <div className="card svc reveal" key={name}>
              <div className="ico">{emo}</div>
              <h4>{name}</h4>
              <p>{desc}</p>
              <a href="#">Découvrir →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
