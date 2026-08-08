import api from "./api.js";

export async function enregistrerConsultation(rendezVousId, payload) {
  const { data } = await api.post(`/medecin/rendez-vous/${rendezVousId}/consultation`, payload);
  return data.data;
}
