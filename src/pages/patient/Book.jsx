import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../components/patient/Topbar.jsx";
import Calendar from "../../components/patient/Calendar.jsx";
import {
  getSpecialites,
  getMedecins,
  getCreneaux,
  creerRendezVous,
} from "../../services/rendezvous.js";
import { toDateKey, formatDateLongLocale, formatHeureSlot } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const SPECIALITE_EMOJI = {
  heart: "❤️",
  baby: "👶",
  female: "🤰",
  stethoscope: "🩺",
  skin: "🧴",
  ear: "👂",
  brain: "🧠",
  flask: "🧪",
};

const STEP_SUBTITLES = {
  1: "Étape 1 sur 4 — choisissez une spécialité.",
  2: "Étape 2 sur 4 — choisissez votre médecin.",
  3: "Étape 3 sur 4 — choisissez votre date et votre créneau.",
  4: "Étape 4 sur 4 — vérifiez et confirmez.",
};

export default function PatientBook() {
  const [step, setStep] = useState(1);

  const [specialites, setSpecialites] = useState([]);
  const [loadingSpecialites, setLoadingSpecialites] = useState(true);
  const [specialite, setSpecialite] = useState(null);

  const [medecins, setMedecins] = useState([]);
  const [loadingMedecins, setLoadingMedecins] = useState(false);
  const [medecin, setMedecin] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [creneaux, setCreneaux] = useState([]);
  const [loadingCreneaux, setLoadingCreneaux] = useState(false);
  const [selectedHeure, setSelectedHeure] = useState(null);

  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  // Garde-fou contre les réponses qui arrivent dans le désordre : si l'utilisateur
  // clique vite sur deux jours différents, seule la réponse de la dernière requête
  // doit être appliquée (sinon une réponse plus ancienne peut écraser l'état avec
  // les créneaux du mauvais jour).
  const creneauxRequestRef = useRef(0);

  useEffect(() => {
    getSpecialites()
      .then(setSpecialites)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoadingSpecialites(false));
  }, []);

  function handleSelectSpecialite(spec) {
    setSpecialite(spec);
    setMedecin(null);
    setError("");
    setStep(2);
    setLoadingMedecins(true);
    getMedecins(spec.id)
      .then(setMedecins)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoadingMedecins(false));
  }

  function handleSelectMedecin(m) {
    setMedecin(m);
    setSelectedDate(null);
    setCreneaux([]);
    setSelectedHeure(null);
    setError("");
    setStep(3);
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
    setSelectedHeure(null);
    setError("");
    setLoadingCreneaux(true);
    const requestId = ++creneauxRequestRef.current;
    getCreneaux(medecin.id, toDateKey(date))
      .then((data) => {
        if (requestId === creneauxRequestRef.current) setCreneaux(data);
      })
      .catch((err) => {
        if (requestId === creneauxRequestRef.current) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (requestId === creneauxRequestRef.current) setLoadingCreneaux(false);
      });
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      const dateHeure = `${toDateKey(selectedDate)} ${selectedHeure}:00`;
      const created = await creerRendezVous({ medecinId: medecin.id, dateHeure, motif });
      setSuccess(created);
    } catch (err) {
      setError(extractErrorMessage(err));
      if (err.response?.status === 422) {
        // Le créneau a probablement été pris entre-temps : on revient à l'étape 3
        // et on recharge les créneaux pour refléter l'état réel.
        setStep(3);
        handleSelectDate(selectedDate);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="patient-app-content">
        <Topbar title="Rendez-vous confirmé" />
        <div className="card success-screen">
          <div className="success-icon">✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Rendez-vous confirmé</h2>
          <p style={{ color: "var(--sub)", maxWidth: 440 }}>
            Votre rendez-vous avec <b>Dr {medecin.user.prenom} {medecin.user.nom}</b> ({medecin.specialite.nom}) le{" "}
            <b>{formatDateLongLocale(selectedDate)}</b> à <b>{formatHeureSlot(selectedHeure)}</b> a bien été enregistré.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Link className="btn btn-primary" to="/patient/appointments">
              Voir mes rendez-vous
            </Link>
            <Link className="btn btn-ghost" to="/patient">
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1, label: "Spécialité", detail: specialite?.nom },
    { n: 2, label: "Médecin", detail: medecin ? `Dr ${medecin.user.nom}` : null },
    { n: 3, label: "Date & créneau", detail: selectedDate && selectedHeure ? formatHeureSlot(selectedHeure) : null },
    { n: 4, label: "Confirmation", detail: null },
  ];

  return (
    <>
      <Topbar title="Prendre un rendez-vous" subtitle={STEP_SUBTITLES[step]} />

      <div className="stepper">
        {steps.map((s, i) => (
          <Fragment key={s.n}>
            <div className={`stp ${step > s.n ? "done" : step === s.n ? "current" : ""}`}>
              <div className="n">{step > s.n ? "✓" : s.n}</div>
              <div>
                <b>{s.label}</b>
                <span>{step > s.n ? s.detail ?? "Fait" : step === s.n ? "En cours" : "À venir"}</span>
              </div>
            </div>
            {i < steps.length - 1 && <div className="stp-sep"></div>}
          </Fragment>
        ))}
      </div>

      {error && step !== 3 && <div className="alert-error">{error}</div>}

      {step === 1 && (
        <>
          {loadingSpecialites ? (
            <p className="empty-state">Chargement des spécialités…</p>
          ) : (
            <div className="grid-3">
              {specialites.map((s) => (
                <div key={s.id} className="card clickable" onClick={() => handleSelectSpecialite(s)}>
                  <div className="stat">
                    <div className="ic">{SPECIALITE_EMOJI[s.icone] ?? "🏥"}</div>
                    <div>
                      <b style={{ fontSize: 15 }}>{s.nom}</b>
                      {s.description && <span>{s.description}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <button type="button" className="btn btn-ghost btn-sm" style={{ width: "fit-content" }} onClick={() => setStep(1)}>
            ← Changer de spécialité
          </button>
          {loadingMedecins ? (
            <p className="empty-state">Chargement des médecins…</p>
          ) : medecins.length === 0 ? (
            <p className="empty-state">Aucun médecin disponible pour cette spécialité pour le moment.</p>
          ) : (
            <div className="grid-3">
              {medecins.map((m) => (
                <div key={m.id} className="card doc clickable" onClick={() => handleSelectMedecin(m)}>
                  <div className="doc-photo">🧑🏾‍⚕️</div>
                  <div className="doc-body">
                    <b>
                      Dr {m.user.prenom} {m.user.nom}
                    </b>
                    <span className="spec">{m.specialite.nom}</span>
                    <span className="meta">
                      {m.annees_experience} an{m.annees_experience > 1 ? "s" : ""} d'expérience
                      {m.titre ? ` · ${m.titre}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === 3 && medecin && (
        <div className="grid-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card">
              <Calendar selectedDate={selectedDate} onSelect={handleSelectDate} />
            </div>
            <div className="card">
              <h3>{selectedDate ? `Créneaux disponibles — ${formatDateLongLocale(selectedDate)}` : "Créneaux disponibles"}</h3>
              {!selectedDate && <p className="empty-state">Sélectionnez une date dans le calendrier.</p>}
              {selectedDate && loadingCreneaux && <p className="empty-state">Chargement des créneaux…</p>}
              {selectedDate && !loadingCreneaux && creneaux.length === 0 && (
                <p className="empty-state">Aucun créneau pour cette date. Choisissez un autre jour.</p>
              )}
              {selectedDate && !loadingCreneaux && creneaux.length > 0 && (
                <div className="slots">
                  {creneaux.map((c) => (
                    <div
                      key={c.heure}
                      className={`slot${!c.disponible ? " off" : ""}${selectedHeure === c.heure ? " sel" : ""}`}
                      style={{ cursor: c.disponible ? "pointer" : "default" }}
                      onClick={() => c.disponible && setSelectedHeure(c.heure)}
                    >
                      {formatHeureSlot(c.heure)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <h3>Résumé</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
              <div className="avatar" style={{ width: 54, height: 54, fontSize: 24 }}>
                🧑🏾‍⚕️
              </div>
              <div>
                <b style={{ fontSize: 15 }}>
                  Dr {medecin.user.prenom} {medecin.user.nom}
                </b>
                <br />
                <span style={{ fontSize: 12.5, color: "var(--blue)", fontWeight: 600 }}>{medecin.specialite.nom}</span>
              </div>
            </div>
            {error && <div className="alert-error" style={{ marginBottom: 14 }}>{error}</div>}
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={!selectedHeure}
              onClick={() => setStep(4)}
            >
              Continuer →
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }} onClick={() => setStep(2)}>
              ← Étape précédente
            </button>
          </div>
        </div>
      )}

      {step === 4 && medecin && selectedDate && selectedHeure && (
        <div className="grid-2">
          <div className="card">
            <h3>Récapitulatif</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
              <div className="avatar" style={{ width: 54, height: 54, fontSize: 24 }}>
                🧑🏾‍⚕️
              </div>
              <div>
                <b style={{ fontSize: 15 }}>
                  Dr {medecin.user.prenom} {medecin.user.nom}
                </b>
                <br />
                <span style={{ fontSize: 12.5, color: "var(--blue)", fontWeight: 600 }}>{medecin.specialite.nom}</span>
              </div>
            </div>
            <div className="recap">
              <div className="row">
                <span>Date</span>
                <b>{formatDateLongLocale(selectedDate)}</b>
              </div>
              <div className="row">
                <span>Heure</span>
                <b>{formatHeureSlot(selectedHeure)}</b>
              </div>
              <div className="row">
                <span>Durée</span>
                <b>30 minutes</b>
              </div>
            </div>
            <div className="field" style={{ marginTop: 18 }}>
              <label htmlFor="motif">Motif de consultation (facultatif)</label>
              <textarea
                id="motif"
                className="input"
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex : consultation de suivi, renouvellement d'ordonnance…"
                maxLength={255}
              />
            </div>
            {error && <div className="alert-error" style={{ marginTop: 14 }}>{error}</div>}
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 18 }}
              disabled={submitting}
              onClick={handleConfirm}
            >
              {submitting ? "Confirmation…" : "Confirmer le rendez-vous →"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: "100%", marginTop: 10 }}
              disabled={submitting}
              onClick={() => setStep(3)}
            >
              ← Étape précédente
            </button>
          </div>
        </div>
      )}
    </>
  );
}
