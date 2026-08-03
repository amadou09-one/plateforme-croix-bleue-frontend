import api from "./api.js";

export async function definirMotDePasse(payload) {
  const { data } = await api.post("/definir-mot-de-passe", payload);
  return data.message;
}
