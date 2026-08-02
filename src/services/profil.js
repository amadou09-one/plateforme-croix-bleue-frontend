import api from "./api.js";

export async function getProfil() {
  const { data } = await api.get("/profil");
  return data.data;
}

export async function updateProfil(payload) {
  const { data } = await api.put("/profil", payload);
  return data.data;
}

export async function updatePassword(payload) {
  const { data } = await api.put("/profil/mot-de-passe", payload);
  return data.message;
}

export async function updatePreferences(payload) {
  const { data } = await api.put("/preferences", payload);
  return data.data;
}
