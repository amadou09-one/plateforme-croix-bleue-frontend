import { useEffect, useState } from "react";
import Topbar from "../../components/secretaire/Topbar.jsx";
import { getPlanning } from "../../services/secretaire.js";
import { formatDateLongLocale, formatHeureSlot, toDateKey } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

export default function SecretairePlanning() {
  const [date, setDate] = useState(() => new Date());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [medecinSelectionne, setMedecinSelectionne] = useState(null);

  useEffect(() => {
    setData(null);
    setError("");
    getPlanning(toDateKey(date))
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)));
  }, [date]);

  function changerJour(delta) {
    setDate((d) => {
      const suivant = new Date(d);
      suivant.setDate(suivant.getDate() + delta);
      return suivant;
    });
  }

  const medecinsAffiches = data
    ? medecinSelectionne
      ? data.medecins.filter((m) => m.id === medecinSelectionne)
      : data.medecins
    : [];

  return (
    <>
      <Topbar title="Planning global" subtitle="Vue consolidée de tous les médecins de la clinique." />

      {error && <div className="alert-error">{error}</div>}

      {data && (
        <div className="tabs">
          <button
            type="button"
            className={`tab${medecinSelectionne === null ? " active" : ""}`}
            onClick={() => setMedecinSelectionne(null)}
          >
            Tous les médecins
          </button>
          {data.medecins.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`tab${medecinSelectionne === m.id ? " active" : ""}`}
              onClick={() => setMedecinSelectionne(m.id)}
            >
              {m.nom}
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <h3>
          🗓 {formatDateLongLocale(date)}
          <span style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => changerJour(-1)}>
              ‹ Jour précédent
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => changerJour(1)}>
              Jour suivant ›
            </button>
          </span>
        </h3>

        {!data && !error && <p className="empty-state">Chargement du planning…</p>}

        {data && data.medecins.length === 0 && <p className="empty-state">Aucun médecin actif.</p>}

        {data && data.medecins.length > 0 && (
          <table className="tbl">
            <thead>
              <tr>
                <th>Heure</th>
                {medecinsAffiches.map((m) => (
                  <th key={m.id}>{m.nom}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.planning.length === 0 ? (
                <tr>
                  <td colSpan={medecinsAffiches.length + 1}>
                    <p className="empty-state">Aucun créneau ce jour-là.</p>
                  </td>
                </tr>
              ) : (
                data.planning.map((ligne) => (
                  <tr key={ligne.heure}>
                    <td>
                      <b>{formatHeureSlot(ligne.heure)}</b>
                    </td>
                    {medecinsAffiches.map((m) => {
                      const entree = ligne.medecins.find((e) => e.medecin_id === m.id);
                      if (!entree || entree.statut === "ferme") {
                        return (
                          <td key={m.id}>
                            <span className="badge b-gray">Fermé</span>
                          </td>
                        );
                      }
                      if (entree.statut === "rdv") {
                        return (
                          <td key={m.id}>
                            <span className={`badge ${entree.rdv.statut === "en_attente" ? "b-warn" : "b-blue"}`}>
                              {entree.rdv.patient?.prenom} {entree.rdv.patient?.nom}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={m.id}>
                          <span className="badge b-gray">Libre</span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
