const ROLE_HOME = {
  patient: "/patient",
  medecin: "/medecin",
  secretaire: "/secretaire",
  admin: "/admin",
};

export function roleHome(role) {
  return ROLE_HOME[role] ?? "/";
}
