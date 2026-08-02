import api from "./api.js";

export async function getAgenda(dateKey) {
  const { data } = await api.get("/medecin/agenda", { params: dateKey ? { date: dateKey } : {} });
  return data.data;
}

export async function getStats() {
  const { data } = await api.get("/medecin/stats");
  return data.data;
}

export async function changerStatutRdv(id, statut) {
  const { data } = await api.patch(`/rendez-vous/${id}/statut`, { statut });
  return data.data;
}

export async function updateBioMedecin(bio) {
  const { data } = await api.put("/medecin/profil", { bio });
  return data.data;
}
