import api from "./api.js";

export async function getDossierMedical() {
  const { data } = await api.get("/patient/dossier");
  return data.data;
}
