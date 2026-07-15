import api from "./api.js";

export async function login(email, password) {
  const { data } = await api.post("/login", { email, password });
  return data.data;
}

export async function register(payload) {
  const { data } = await api.post("/register", payload);
  return data.data;
}

export async function logout() {
  await api.post("/logout");
}

export async function getMe() {
  const { data } = await api.get("/me");
  return data.data;
}
