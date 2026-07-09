import { useState } from "react";
import { Link } from "react-router-dom";

const DOCTORS = [
  { emo: "👩🏾‍⚕️", name: "Dr Aïssatou Ndiaye", spec: "Cardiologie", exp: "Doctorat UCAD · 12 ans d'expérience", note: "⭐ 4,9 · 216 avis", dispo: "Disponible aujourd'hui" },
  { emo: "👨🏾‍⚕️", name: "Dr Mamadou Sarr", spec: "Pédiatrie", exp: "Doctorat UCAD · 9 ans d'expérience", note: "⭐ 4,8 · 174 avis", dispo: "Disponible demain" },
  { emo: "👩🏾‍⚕️", name: "Dr Fatou Diop", spec: "Gynécologie", exp: "Doctorat Cheikh Anta Diop · 15 ans", note: "⭐ 5,0 · 302 avis", dispo: "Disponible aujourd'hui" },
  { emo: "👨🏾‍⚕️", name: "Dr Ibrahima Fall", spec: "Médecine générale", exp: "Doctorat UCAD · 11 ans d'expérience", note: "⭐ 4,9 · 258 avis", dispo: "Disponible aujourd'hui" },
];

const SPECS = ["Toutes les spécialités", "Médecine générale", "Cardiologie", "Pédiatrie", "Gynécologie", "Dermatologie", "ORL", "Neurologie"];

export default function Doctors() {
  const [query, setQuery] = useState("");
  const [spec, setSpec] = useState(SPECS[0]);

  const filtered = DOCTORS.filter((d) => {
    const okName = d.name.toLowerCase().includes(query.toLowerCase());
    const okSpec = spec === SPECS[0] || d.spec === spec;
    return okName && okSpec;
  });

  return (
    <section className="doctors" id="medecins">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Nos médecins</span>
          <h2>Une équipe de spécialistes à votre écoute</h2>
          <p>Des praticiens diplômés et expérimentés, engagés pour votre santé au quotidien.</p>
        </div>

        <div className="doc-search reveal">
          <input
            className="input"
            type="text"
            placeholder="🔍 Rechercher un médecin par nom…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="input" value={spec} onChange={(e) => setSpec(e.target.value)}>
            {SPECS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" type="button">Rechercher</button>
        </div>

        <div className="grid-4">
          {filtered.map((d) => (
            <div className="card doc reveal" key={d.name}>
              <div className="doc-photo ph"><span className="emo">{d.emo}</span><span>Photo portrait</span></div>
              <div className="doc-body">
                <h4>{d.name}</h4>
                <span className="spec">{d.spec}</span>
                <span className="doc-meta">{d.exp}<br />{d.note}</span>
                <span className="doc-badge">{d.dispo}</span>
                <Link className="btn btn-primary" to="/connexion">Prendre rendez-vous</Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--sub)" }}>
              Aucun médecin ne correspond à votre recherche.
            </p>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <a className="btn btn-ghost" href="#">Voir tous nos médecins →</a>
        </div>
      </div>
    </section>
  );
}
