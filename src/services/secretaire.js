import api from "./api.js";

export async function getStats() {
  const { data } = await api.get("/secretaire/stats");
  return data.data;
}

export async function getPlanning(dateKey) {
  const { data } = await api.get("/secretaire/planning", { params: dateKey ? { date: dateKey } : {} });
  return data.data;
}

export async function confirmerRdv(id) {
  const { data } = await api.patch(`/rendez-vous/${id}/confirmer`);
  return data.data;
}
