const FAQ = [
  ["Comment prendre rendez-vous en ligne ?", "Créez un compte gratuit, choisissez votre médecin et le créneau qui vous convient, puis validez. Vous recevez une confirmation immédiate par SMS et par e-mail.", true],
  ["Quels sont les horaires de la clinique ?", "Les consultations ont lieu du lundi au samedi de 8 h à 20 h. Le service des urgences est ouvert 24 h/24 et 7 j/7."],
  ["Acceptez-vous les assurances et mutuelles ?", "Oui, nous travaillons avec les principales compagnies d'assurance santé et mutuelles du Sénégal. Présentez simplement votre carte lors de votre visite."],
  ["Comment annuler ou reporter un rendez-vous ?", "Depuis votre espace patient, vous pouvez annuler ou reporter un rendez-vous jusqu'à 6 heures avant l'horaire prévu, sans frais."],
  ["Les résultats d'analyses sont-ils disponibles en ligne ?", "Oui, vos résultats de laboratoire sont publiés dans votre espace patient sécurisé dès leur validation par notre biologiste."],
];

export default function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">FAQ</span>
          <h2>Questions les plus fréquentes</h2>
        </div>
        <div className="faq-wrap reveal">
          {FAQ.map(([q, a, open]) => (
            <details key={q} open={open}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
