import api from "./api.js";

export async function getPatients({ recherche, statut } = {}) {
  const { data } = await api.get("/medecin/patients", {
    params: {
      recherche: recherche || undefined,
      statut: statut || undefined,
    },
  });
  return data.data;
}

export async function getPatient(id) {
  const { data } = await api.get(`/medecin/patients/${id}`);
  return data.data;
}
