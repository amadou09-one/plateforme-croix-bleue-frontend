import api from "./api.js";

export async function getNotifications(page = 1) {
  const { data } = await api.get("/patient/notifications", { params: { page } });
  return data.data;
}

export async function getNonLuesCount() {
  const { data } = await api.get("/patient/notifications/non-lues/count");
  return data.data.count;
}

export async function marquerLue(id) {
  const { data } = await api.put(`/patient/notifications/${id}/lue`);
  return data.data;
}

export async function toutMarquerLu() {
  await api.put("/patient/notifications/tout-lu");
}
