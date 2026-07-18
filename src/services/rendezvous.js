import api from "./api.js";

export async function getSpecialites() {
  const { data } = await api.get("/specialites");
  return data.data;
}

export async function getMedecins(specialiteId) {
  const { data } = await api.get("/medecins", {
    params: specialiteId ? { specialite_id: specialiteId } : {},
  });
  return data.data;
}

export async function getCreneaux(medecinId, dateKey) {
  const { data } = await api.get(`/medecins/${medecinId}/creneaux`, {
    params: { date: dateKey },
  });
  return data.data;
}

export async function creerRendezVous({ medecinId, dateHeure, motif }) {
  const { data } = await api.post("/rendez-vous", {
    medecin_id: medecinId,
    date_heure: dateHeure,
    motif: motif || undefined,
  });
  return data.data;
}

export async function getMesRendezVous() {
  const { data } = await api.get("/mes-rendez-vous");
  return data.data;
}

export async function annulerRendezVous(id, motifAnnulation) {
  const { data } = await api.patch(`/rendez-vous/${id}/annuler`, {
    motif_annulation: motifAnnulation || undefined,
  });
  return data.data;
}
