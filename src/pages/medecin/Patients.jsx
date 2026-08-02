import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../components/medecin/Topbar.jsx";
import { getPatients } from "../../services/patients.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const STATUT_BADGE = {
  actif: { label: "Actif", cls: "b-green" },
  nouveau: { label: "Nouveau", cls: "b-blue" },
  inactif: { label: "Inactif", cls: "b-gray" },
};

function initiales(patient) {
  const a = patient.prenom?.charAt(0) ?? "";
  const b = patient.nom?.charAt(0) ?? "";
  return (a + b).toUpperCase();
}

function formatDateCourte(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function MedecinPatients() {
  const [patients, setPatients] = useState(null);
  const [error, setError] = useState("");
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");

  useEffect(() => {
    const requete = getPatients({ recherche, statut });
    requete.then(setPatients).catch((err) => setError(extractErrorMessage(err)));
  }, [recherche, statut]);

  return (
    <>
      <Topbar
        title="Mes patients"
        subtitle={patients ? `${patients.length} patient${patients.length > 1 ? "s" : ""} suivi${patients.length > 1 ? "s" : ""} · liste triée par prochain rendez-vous.` : ""}
      />

      <div className="searchbar">
        <input
          type="text"
          className="input"
          style={{ flex: 1.4 }}
          placeholder="🔍 Rechercher un patient par nom…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select className="input" value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="nouveau">Nouveau</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <h3>
          Mes patients{" "}
          {patients && <span className="badge b-blue">{patients.length} patient{patients.length > 1 ? "s" : ""} suivi{patients.length > 1 ? "s" : ""}</span>}
        </h3>

        {!patients && !error && <p className="empty-state">Chargement…</p>}
        {patients && patients.length === 0 && <p className="empty-state">Aucun patient ne correspond à ces critères.</p>}

        {patients && patients.length > 0 && (
          <table className="patients">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Dernière consultation</th>
                <th>Prochain RDV</th>
                <th>Allergies</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const badge = STATUT_BADGE[p.statut] ?? STATUT_BADGE.inactif;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="pat-cell">
                        <div className="avatar">{initiales(p)}</div>
                        <div>
                          <b>
                            {p.prenom} {p.nom}
                          </b>
                          <span>
                            {p.age != null ? `${p.age} ans` : "Âge inconnu"}
                            {p.groupe_sanguin ? ` · ${p.groupe_sanguin}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{formatDateCourte(p.derniere_consultation) ?? "Nouveau patient"}</td>
                    <td>{formatDateCourte(p.prochain_rdv) ?? "—"}</td>
                    <td>
                      {p.allergies ? (
                        <span className="allergy-tag">⚠️ {p.allergies}</span>
                      ) : (
                        <span style={{ color: "var(--sub)", fontSize: 12 }}>Aucune connue</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td>
                      <Link className="btn btn-ghost btn-sm" to={`/medecin/patients/${p.id}`}>
                        Voir dossier
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
