import api from "./api.js";

export async function rechercherPatients(q) {
  const { data } = await api.get("/secretaire/patients/recherche", { params: { q } });
  return data.data;
}

export async function getPatients({ q, tri, page } = {}) {
  const { data } = await api.get("/secretaire/patients", {
    params: { q: q || undefined, tri: tri || undefined, page: page || undefined },
  });
  return data.data;
}

export async function creerPatient(payload) {
  const { data } = await api.post("/secretaire/patients", payload);
  return data.data;
}
