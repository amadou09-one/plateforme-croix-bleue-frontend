export function extractErrorMessage(error) {
  if (error.response) {
    const { data } = error.response;
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
    return firstFieldError || data?.message || "Une erreur est survenue. Veuillez réessayer.";
  }
  return "Impossible de contacter le serveur. Vérifiez votre connexion.";
}

export function extractFieldErrors(error) {
  return error.response?.data?.errors || {};
}
