import api from "./api.js";

export async function telechargerDocument(id, nomFichier) {
  const response = await api.get(`/documents/${id}/telecharger`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier ? `${nomFichier}.pdf` : "document.pdf";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.URL.revokeObjectURL(url);
}
