import { useState } from "react";

const PAGES = [
  [
    ["t1", "🛋️", "Salle d'attente"],
    ["t2", "🏥", "Bloc opératoire"],
    ["t3", "🚪", "Cabinets de consultation"],
    ["t4", "🧲", "IRM"],
    ["t2", "💻", "Scanner"],
    ["t1", "🩺", "Consultation"],
  ],
  [
    ["t4", "🧪", "Laboratoire"],
    ["t3", "💊", "Pharmacie"],
    ["t1", "🚑", "Urgences"],
    ["t2", "🧑🏾‍⚕️", "Notre personnel"],
  ],
];

export default function Gallery() {
  const [page, setPage] = useState(0);
  const total = PAGES.length;
  const count = PAGES.flat().length;

  return (
    <section className="gallery">
      <div className="container">
        <div className="sec-head reveal">
          <span className="overline">Galerie</span>
          <h2>Découvrez notre clinique en images</h2>
        </div>
        <div className="masonry reveal">
          {PAGES[page].map(([cls, emo, label]) => (
            <div className={`tile ${cls} ph`} key={label}>
              <span className="emo">{emo}</span>{label}
            </div>
          ))}
        </div>
        <div className="pagination reveal">
          <div className="page" onClick={() => setPage(Math.max(0, page - 1))}>‹</div>
          {PAGES.map((_, i) => (
            <div key={i} className={`page ${i === page ? "active" : ""}`} onClick={() => setPage(i)}>
              {i + 1}
            </div>
          ))}
          <div className="page" onClick={() => setPage(Math.min(total - 1, page + 1))}>›</div>
          <span className="page-info">Page {page + 1} sur {total} — {count} photos</span>
        </div>
      </div>
    </section>
  );
}
