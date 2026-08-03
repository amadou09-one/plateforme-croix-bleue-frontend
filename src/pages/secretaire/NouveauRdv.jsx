import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Topbar from "../../components/secretaire/Topbar.jsx";
import { rechercherPatients } from "../../services/secretairePatients.js";
import { getSpecialites, getMedecins, getCreneaux, creerRendezVous } from "../../services/rendezvous.js";
import { formatDateLongLocale, formatHeureSlot, toDateKey } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

function initiales(patient) {
  const a = patient.prenom?.charAt(0) ?? "";
  const b = patient.nom?.charAt(0) ?? "";
  return (a + b).toUpperCase();
}

export default function SecretaireNouveauRdv() {
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [resultats, setResultats] = useState([]);
  const [recherche, setRecherche] = useState(false);
  const [patient, setPatient] = useState(location.state?.patient ?? null);

  const [specialites, setSpecialites] = useState([]);
  const [specialiteId, setSpecialiteId] = useState("");
  const [medecins, setMedecins] = useState([]);
  const [medecinId, setMedecinId] = useState("");
  const [date, setDate] = useState("");
  const [creneaux, setCreneaux] = useState([]);
  const [heure, setHeure] = useState("");
  const [motif, setMotif] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSpecialites().then(setSpecialites).catch(() => {});
  }, []);

  useEffect(() => {
    if (patient || query.trim().length < 2) {
      setResultats([]);
      return;
    }
    setRecherche(true);
    const handle = setTimeout(() => {
      rechercherPatients(query)
        .then(setResultats)
        .catch(() => setResultats([]))
        .finally(() => setRecherche(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, patient]);

  useEffect(() => {
    if (!specialiteId) {
      setMedecins([]);
      return;
    }
    getMedecins(specialiteId).then(setMedecins).catch(() => {});
    setMedecinId("");
  }, [specialiteId]);

  useEffect(() => {
    if (!medecinId || !date) {
      setCreneaux([]);
      return;
    }
    getCreneaux(medecinId, date)
      .then(setCreneaux)
      .catch(() => setCreneaux([]));
    setHeure("");
  }, [medecinId, date]);

  function reinitialiserPatient() {
    setPatient(null);
    setQuery("");
    setResultats([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const created = await creerRendezVous({
        medecinId,
        dateHeure: `${date} ${heure}:00`,
        motif,
        patientId: patient.id,
      });
      setSuccess(created);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const medecin = medecins.find((m) => String(m.id) === String(medecinId));
    return (
      <>
        <Topbar title="Rendez-vous créé" />
        <div className="card success-screen">
          <div className="success-icon">✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Rendez-vous créé avec succès</h2>
          <p style={{ color: "var(--sub)", maxWidth: 440 }}>
            Le rendez-vous de <b>{patient.prenom} {patient.nom}</b>
            {medecin ? (
              <>
                {" "}
                avec <b>Dr {medecin.user.prenom} {medecin.user.nom}</b>
              </>
            ) : null}{" "}
            le <b>{formatDateLongLocale(new Date(date))}</b> à <b>{formatHeureSlot(heure)}</b> a bien été enregistré.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Link className="btn btn-primary" to="/secretaire/planning">
              Voir le planning
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSuccess(null);
                reinitialiserPatient();
                setSpecialiteId("");
                setMedecinId("");
                setDate("");
                setHeure("");
                setMotif("");
              }}
            >
              Créer un autre rendez-vous
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Créer un rendez-vous" subtitle="Prise de rendez-vous au comptoir pour un patient." />

      <div className="grid-2">
        <div className="card">
          <h3>🔍 Rechercher un patient</h3>

          {patient ? (
            <div className="card" style={{ background: "var(--bg)", border: "none" }}>
              <div className="cell" style={{ justifyContent: "space-between" }}>
                <div className="cell">
                  <div className="avatar">{initiales(patient)}</div>
                  <div>
                    <b>
                      {patient.prenom} {patient.nom}
                    </b>
                    <span>
                      {patient.telephone}
                      {patient.groupe_sanguin ? ` · ${patient.groupe_sanguin}` : ""}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={reinitialiserPatient}>
                  Changer
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="searchbar" style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="🔍 Nom, téléphone ou e-mail du patient…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <p style={{ fontSize: 12.5, color: "var(--sub)", marginBottom: 16 }}>
                Patient introuvable ?{" "}
                <Link to="/secretaire/patients" state={{ prefillPrenom: query }} style={{ color: "var(--blue)", fontWeight: 600 }}>
                  Enregistrer un nouveau patient →
                </Link>
              </p>

              {recherche && <p className="empty-state">Recherche…</p>}
              {!recherche && query.trim().length >= 2 && resultats.length === 0 && (
                <p className="empty-state">Aucun patient trouvé.</p>
              )}
              {resultats.map((p) => (
                <div key={p.id} className="resultat-patient" onClick={() => setPatient(p)}>
                  <div className="cell">
                    <div className="avatar">{initiales(p)}</div>
                    <div>
                      <b>
                        {p.prenom} {p.nom}
                      </b>
                      <span>
                        {p.telephone}
                        {p.groupe_sanguin ? ` · ${p.groupe_sanguin}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="card">
          <h3>📋 Détails du rendez-vous</h3>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert-error" style={{ marginBottom: 14 }}>{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label htmlFor="specialite">Spécialité</label>
                <select id="specialite" className="input" value={specialiteId} onChange={(e) => setSpecialiteId(e.target.value)} required>
                  <option value="">Choisir…</option>
                  {specialites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="medecin">Médecin</label>
                <select
                  id="medecin"
                  className="input"
                  value={medecinId}
                  onChange={(e) => setMedecinId(e.target.value)}
                  disabled={!specialiteId}
                  required
                >
                  <option value="">Choisir…</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr {m.user.prenom} {m.user.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  className="input"
                  min={toDateKey(new Date())}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!medecinId}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="creneau">Créneau</label>
                <select
                  id="creneau"
                  className="input"
                  value={heure}
                  onChange={(e) => setHeure(e.target.value)}
                  disabled={!date || creneaux.length === 0}
                  required
                >
                  <option value="">Choisir…</option>
                  {creneaux
                    .filter((c) => c.disponible)
                    .map((c) => (
                      <option key={c.heure} value={c.heure}>
                        {formatHeureSlot(c.heure)}
                      </option>
                    ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="motif">Motif (facultatif)</label>
                <textarea id="motif" className="input" rows={3} value={motif} onChange={(e) => setMotif(e.target.value)} maxLength={255} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 20 }} disabled={!patient || submitting}>
              {submitting ? "Création…" : "Confirmer le rendez-vous"}
            </button>
            {!patient && (
              <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 8, textAlign: "center" }}>
                Sélectionnez d'abord un patient.
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
