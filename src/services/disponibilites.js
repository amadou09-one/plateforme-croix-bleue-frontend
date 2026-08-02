import api from "./api.js";

export async function getDisponibilites() {
  const { data } = await api.get("/medecin/disponibilites");
  return data.data;
}

export async function updateDisponibilite({ jourSemaine, plages, dureeCreneauMin }) {
  const { data } = await api.put("/medecin/disponibilites", {
    jour_semaine: jourSemaine,
    plages,
    duree_creneau_min: dureeCreneauMin,
  });
  return data.data;
}
