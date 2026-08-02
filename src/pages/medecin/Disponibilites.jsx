import { useEffect, useState } from "react";
import Topbar from "../../components/medecin/Topbar.jsx";
import { getDisponibilites, updateDisponibilite } from "../../services/disponibilites.js";
import { getBlocages, creerBlocage, supprimerBlocage } from "../../services/blocages.js";
import { formatDateLongApi } from "../../utils/date.js";
import { extractErrorMessage } from "../../utils/apiError.js";

const JOURS_COURT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const JOURS_LONG = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DUREES = [15, 20, 30, 45, 60];

function extraireDemiJournees(plages) {
  const matin = plages.find((p) => p.heure_debut < "13:00") ?? null;
  const apresMidi = plages.find((p) => p.heure_debut >= "13:00") ?? null;
  return { matin, apresMidi };
}

function EditeurDemiJournee({ label, actif, onToggle, debut, fin, onChangeDebut, onChangeFin, disabled }) {
  return (
    <div className="time-row">
      <div className="toggle-day">
        <button type="button" className={`switch${actif ? " on" : ""}`} onClick={onToggle} disabled={disabled} aria-pressed={actif} aria-label={`Activer ou désactiver ${label}`}></button>
        <b style={{ fontSize: 13.5 }}>{label}</b>
      </div>
      <input type="time" className="time-input" value={debut} onChange={(e) => onChangeDebut(e.target.value)} disabled={!actif || disabled} />
      <span style={{ color: "var(--sub)" }}>→</span>
      <input type="time" className="time-input" value={fin} onChange={(e) => onChangeFin(e.target.value)} disabled={!actif || disabled} />
    </div>
  );
}

export default function MedecinDisponibilites() {
  const [jours, setJours] = useState(null);
  const [jourSelectionne, setJourSelectionne] = useState(1);
  const [edition, setEdition] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rdvConcernes, setRdvConcernes] = useState([]);

  const [blocages, setBlocages] = useState([]);
  const [blocageDate, setBlocageDate] = useState("");
  const [blocageMotif, setBlocageMotif] = useState("");
  const [blocageSaving, setBlocageSaving] = useState(false);
  const [blocageError, setBlocageError] = useState("");

  useEffect(() => {
    getDisponibilites().then(setJours).catch((err) => setError(extractErrorMessage(err)));
    getBlocages().then(setBlocages).catch(() => {});
  }, []);

  useEffect(() => {
    if (!jours) return;
    const jour = jours.find((j) => j.jour_semaine === jourSelectionne);
    const { matin, apresMidi } = extraireDemiJournees(jour.plages);
    setEdition({
      matinActif: !!matin,
      matinDebut: matin?.heure_debut ?? "08:00",
      matinFin: matin?.heure_fin ?? "12:00",
      apresMidiActif: !!apresMidi,
      apresMidiDebut: apresMidi?.heure_debut ?? "15:00",
      apresMidiFin: apresMidi?.heure_fin ?? "18:00",
      dureeCreneauMin: jour.duree_creneau_min,
    });
    setRdvConcernes([]);
    setError("");
  }, [jours, jourSelectionne]);

  async function handleEnregistrer() {
    const plages = [];
    if (edition.matinActif) plages.push({ heure_debut: edition.matinDebut, heure_fin: edition.matinFin });
    if (edition.apresMidiActif) plages.push({ heure_debut: edition.apresMidiDebut, heure_fin: edition.apresMidiFin });

    setSaving(true);
    setError("");
    setRdvConcernes([]);

    try {
      await updateDisponibilite({ jourSemaine: jourSelectionne, plages, dureeCreneauMin: edition.dureeCreneauMin });
      setJours((current) =>
        current.map((j) => (j.jour_semaine === jourSelectionne ? { ...j, plages, duree_creneau_min: edition.dureeCreneauMin } : j))
      );
    } catch (err) {
      setError(extractErrorMessage(err));
      setRdvConcernes(err.response?.data?.data?.rendez_vous_concernes ?? []);
    } finally {
      setSaving(false);
    }
  }

  async function handleBloquer(e) {
    e.preventDefault();
    if (!blocageDate) return;
    setBlocageSaving(true);
    setBlocageError("");
    try {
      const resultat = await creerBlocage({ date: blocageDate, motif: blocageMotif });
      setBlocages((current) => [...current, resultat.blocage].sort((a, b) => a.date.localeCompare(b.date)));
      setBlocageDate("");
      setBlocageMotif("");
    } catch (err) {
      setBlocageError(extractErrorMessage(err));
    } finally {
      setBlocageSaving(false);
    }
  }

  async function handleSupprimerBlocage(id) {
    const precedent = blocages;
    setBlocages((current) => current.filter((b) => b.id !== id));
    try {
      await supprimerBlocage(id);
    } catch (err) {
      setBlocages(precedent);
      setBlocageError(extractErrorMessage(err));
    }
  }

  return (
    <>
      <Topbar title="Mes disponibilités" subtitle="Gérez vos horaires de consultation et vos absences." />

      {!jours ? (
        <div className="card">
          <p className="empty-state">Chargement…</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>📅 Vue hebdomadaire</h3>
            <div className="week-grid">
              <div></div>
              {JOURS_COURT.map((label, i) => (
                <div key={label} className={`wh${jourSelectionne === i + 1 ? " active" : ""}`}>
                  {label}
                </div>
              ))}

              <div className="row-label">Matin</div>
              {jours.map((j) => {
                const { matin } = extraireDemiJournees(j.plages);
                return (
                  <div
                    key={`matin-${j.jour_semaine}`}
                    className={`slot-block${matin ? "" : " off"}`}
                    onClick={() => setJourSelectionne(j.jour_semaine)}
                  >
                    {matin ? `${matin.heure_debut.replace(":", "h")}–${matin.heure_fin.replace(":", "h")}` : "Fermé"}
                  </div>
                );
              })}

              <div className="row-label">Après-midi</div>
              {jours.map((j) => {
                const { apresMidi } = extraireDemiJournees(j.plages);
                return (
                  <div
                    key={`am-${j.jour_semaine}`}
                    className={`slot-block${apresMidi ? "" : " off"}`}
                    onClick={() => setJourSelectionne(j.jour_semaine)}
                  >
                    {apresMidi ? `${apresMidi.heure_debut.replace(":", "h")}–${apresMidi.heure_fin.replace(":", "h")}` : "Fermé"}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>⚙️ Modifier un jour — {JOURS_LONG[jourSelectionne - 1]}</h3>

              <div className="chips" style={{ marginBottom: 16 }}>
                {JOURS_COURT.map((label, i) => (
                  <button
                    type="button"
                    key={label}
                    className={`chip${jourSelectionne === i + 1 ? " active" : ""}`}
                    onClick={() => setJourSelectionne(i + 1)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {edition && (
                <>
                  <EditeurDemiJournee
                    label="Matin"
                    actif={edition.matinActif}
                    onToggle={() => setEdition((e) => ({ ...e, matinActif: !e.matinActif }))}
                    debut={edition.matinDebut}
                    fin={edition.matinFin}
                    onChangeDebut={(v) => setEdition((e) => ({ ...e, matinDebut: v }))}
                    onChangeFin={(v) => setEdition((e) => ({ ...e, matinFin: v }))}
                    disabled={saving}
                  />
                  <EditeurDemiJournee
                    label="Après-midi"
                    actif={edition.apresMidiActif}
                    onToggle={() => setEdition((e) => ({ ...e, apresMidiActif: !e.apresMidiActif }))}
                    debut={edition.apresMidiDebut}
                    fin={edition.apresMidiFin}
                    onChangeDebut={(v) => setEdition((e) => ({ ...e, apresMidiDebut: v }))}
                    onChangeFin={(v) => setEdition((e) => ({ ...e, apresMidiFin: v }))}
                    disabled={saving}
                  />
                  <div className="time-row">
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12.5, color: "var(--sub)" }}>Durée des créneaux</span>
                    </div>
                    <select
                      className="time-input"
                      style={{ minWidth: 130 }}
                      value={edition.dureeCreneauMin}
                      onChange={(e) => setEdition((ed) => ({ ...ed, dureeCreneauMin: Number(e.target.value) }))}
                      disabled={saving}
                    >
                      {DUREES.map((d) => (
                        <option key={d} value={d}>
                          {d} minutes
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="alert-error" style={{ marginTop: 14 }}>
                      {error}
                      {rdvConcernes.length > 0 && (
                        <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                          {rdvConcernes.map((r) => (
                            <li key={r.id} style={{ fontSize: 12.5 }}>
                              {r.patient?.prenom} {r.patient?.nom} —{" "}
                              {new Date(r.date_heure).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" })}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <button type="button" className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} disabled={saving} onClick={handleEnregistrer}>
                    {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                  </button>
                </>
              )}
            </div>

            <div className="card">
              <h3>🚫 Bloquer une date</h3>
              <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 16 }}>
                Congés, formation, absence exceptionnelle — bloquez une date sans supprimer votre planning habituel.
              </p>
              <form onSubmit={handleBloquer}>
                <div className="time-row">
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12.5, color: "var(--sub)" }}>Date</span>
                  </div>
                  <input
                    type="date"
                    className="time-input"
                    style={{ minWidth: 140 }}
                    value={blocageDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setBlocageDate(e.target.value)}
                    required
                  />
                </div>
                <div className="time-row">
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12.5, color: "var(--sub)" }}>Motif</span>
                  </div>
                  <input
                    type="text"
                    className="time-input"
                    style={{ minWidth: 140 }}
                    placeholder="Congés, formation…"
                    value={blocageMotif}
                    onChange={(e) => setBlocageMotif(e.target.value)}
                    maxLength={255}
                  />
                </div>

                {blocageError && (
                  <div className="alert-error" style={{ marginTop: 14 }}>
                    {blocageError}
                  </div>
                )}

                <button type="submit" className="btn btn-outline" style={{ width: "100%", marginTop: 16 }} disabled={blocageSaving}>
                  {blocageSaving ? "Blocage en cours…" : "+ Bloquer cette date"}
                </button>
              </form>

              <div style={{ marginTop: 18, padding: "13px 15px", background: "var(--warn-light)", borderRadius: 12, fontSize: 12 }}>
                ⚠️ Les patients ayant déjà un RDV sur une date bloquée seront automatiquement notifiés.
              </div>

              {blocages.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  {blocages.map((b) => (
                    <div className="blocage-row" key={b.id}>
                      <div>
                        <b>{formatDateLongApi(b.date)}</b>
                        {b.motif && <span>{b.motif}</span>}
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleSupprimerBlocage(b.id)}>
                        🗑 Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
