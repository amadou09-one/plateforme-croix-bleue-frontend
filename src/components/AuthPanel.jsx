const BENEFITS = [
  ["🗓", "Prise de rendez-vous en ligne", "Réservez un créneau en quelques clics, 24h/24."],
  ["🔔", "Rappels automatiques", "Notifications par SMS et e-mail avant chaque consultation."],
  ["📁", "Historique médical", "Retrouvez vos consultations et résultats d'analyses."],
  ["🔒", "Données protégées", "Vos informations de santé sont chiffrées et confidentielles."],
];

export default function AuthPanel({ title, lead }) {
  return (
    <aside className="panel">
      <a className="logo" href="/">
        <div className="logo-mark">✚</div>
        <div><b>Clinique Croix Bleue</b><span>Dakar — Sénégal</span></div>
      </a>
      <div className="panel-body">
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {BENEFITS.map(([emo, t, d]) => (
          <div className="benefit" key={t}>
            <div className="ico">{emo}</div>
            <div><b>{t}</b><span>{d}</span></div>
          </div>
        ))}
      </div>
      <p className="panel-foot">© 2026 Clinique Croix Bleue — Plateforme de gestion des rendez-vous médicaux</p>
    </aside>
  );
}
