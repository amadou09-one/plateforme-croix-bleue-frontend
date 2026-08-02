import api from "./api.js";

export async function getBlocages() {
  const { data } = await api.get("/medecin/blocages");
  return data.data;
}

export async function creerBlocage({ date, motif }) {
  const { data } = await api.post("/medecin/blocages", { date, motif: motif || undefined });
  return data.data;
}

export async function supprimerBlocage(id) {
  await api.delete(`/medecin/blocages/${id}`);
}
