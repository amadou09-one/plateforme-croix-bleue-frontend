import api from "./api.js";

export async function getUtilisateurs({ role, statut, recherche, page } = {}) {
  const { data } = await api.get("/admin/utilisateurs", {
    params: {
      role: role || undefined,
      statut: statut || undefined,
      recherche: recherche || undefined,
      page: page || undefined,
    },
  });
  return data.data;
}

export async function creerUtilisateur(payload) {
  const { data } = await api.post("/admin/utilisateurs", payload);
  return data.data;
}

export async function modifierUtilisateur(id, payload) {
  const { data } = await api.put(`/admin/utilisateurs/${id}`, payload);
  return data.data;
}

export async function desactiverUtilisateur(id) {
  const { data } = await api.delete(`/admin/utilisateurs/${id}`);
  return data.data;
}
