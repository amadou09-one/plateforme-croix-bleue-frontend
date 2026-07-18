const MOIS_COURT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MOIS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const JOURS_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const JOURS_COURT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function capitalize(mot) {
  return mot.charAt(0).toUpperCase() + mot.slice(1);
}

/** "YYYY-MM-DD" à partir d'un objet Date local (jour de calendrier, pas une conversion UTC). */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMoisAnnee(date) {
  return `${capitalize(MOIS_LONG[date.getMonth()])} ${date.getFullYear()}`;
}

/**
 * Le Sénégal (Africa/Dakar) est à UTC+0 toute l'année (pas d'heure d'été) : on lit donc
 * les dates renvoyées par l'API (stockées en UTC) via leurs accesseurs UTC, pour ne
 * jamais dépendre du fuseau local du navigateur qui affiche la page.
 */
export function parseApiDate(isoString) {
  return new Date(isoString);
}

export function formatDateCourtApi(isoString) {
  const d = parseApiDate(isoString);
  return `${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function formatMoisCourtApi(isoString) {
  const d = parseApiDate(isoString);
  return MOIS_COURT[d.getUTCMonth()].replace(".", "");
}

export function formatDateLongApi(isoString) {
  const d = parseApiDate(isoString);
  const jour = JOURS_LONG[d.getUTCDay()];
  return `${capitalize(jour)} ${d.getUTCDate()} ${MOIS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatHeureApi(isoString) {
  const d = parseApiDate(isoString);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h} h ${m}`;
}

/** "10:30" -> "10 h 30" (heure déjà exprimée telle que renvoyée par /creneaux). */
export function formatHeureSlot(hhmm) {
  const [h, m] = hhmm.split(":");
  return `${h} h ${m}`;
}

export function formatDateLongLocale(date) {
  const jour = JOURS_LONG[date.getDay()];
  return `${capitalize(jour)} ${date.getDate()} ${MOIS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export const JOURS_COURT_LUNDI_DIMANCHE = [JOURS_COURT[1], JOURS_COURT[2], JOURS_COURT[3], JOURS_COURT[4], JOURS_COURT[5], JOURS_COURT[6], JOURS_COURT[0]];

/**
 * Un RDV est jugé "trop proche pour être annulé" côté client s'il a lieu dans moins de
 * 6 h (règle métier). Comparaison faite sur l'instant UTC réel (Date gère ça nativement),
 * donc correcte indépendamment du fuseau du navigateur.
 */
export function estAnnulableDansPlusDe6h(isoString) {
  const dateRdv = parseApiDate(isoString);
  const limite = new Date(dateRdv.getTime() - 6 * 60 * 60 * 1000);
  return new Date() < limite;
}
