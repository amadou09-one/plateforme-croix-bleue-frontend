import { useState } from "react";
import Topbar from "../../components/patient/Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { updatePassword, updatePreferences } from "../../services/profil.js";
import { extractErrorMessage, extractFieldErrors } from "../../utils/apiError.js";

const MOT_DE_PASSE_VIDE = { mot_de_passe_actuel: "", password: "", password_confirmation: "" };

export default function PatientSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [pwdForm, setPwdForm] = useState(MOT_DE_PASSE_VIDE);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdFieldErrors, setPwdFieldErrors] = useState({});

  const [prefs, setPrefs] = useState({
    notif_email_rdv: user?.notif_email_rdv ?? true,
    notif_email_rappel: user?.notif_email_rappel ?? true,
  });
  const [prefsSaving, setPrefsSaving] = useState(false);

  function handlePwdChange(field) {
    return (e) => setPwdForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwdSaving(true);
    setPwdError("");
    setPwdFieldErrors({});
    try {
      await updatePassword(pwdForm);
      showToast("Mot de passe modifié avec succès.", "success");
      setPwdForm(MOT_DE_PASSE_VIDE);
    } catch (err) {
      setPwdError(extractErrorMessage(err));
      setPwdFieldErrors(extractFieldErrors(err));
    } finally {
      setPwdSaving(false);
    }
  }

  async function togglePref(field) {
    const precedent = prefs;
    const suivant = { ...prefs, [field]: !prefs[field] };
    setPrefs(suivant);
    setPrefsSaving(true);
    try {
      const updated = await updatePreferences(suivant);
      updateUser(updated);
      showToast("Préférences mises à jour.", "success");
    } catch (err) {
      setPrefs(precedent);
      showToast(extractErrorMessage(err), "error");
    } finally {
      setPrefsSaving(false);
    }
  }

  return (
    <>
      <Topbar title="⚙️ Paramètres" subtitle="Gérez vos préférences de notification et votre sécurité." />
      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h3>🔔 Notifications</h3>
          <div className="set-row">
            <div>
              <b>Rendez-vous</b>
              <span>E-mail à la création et à la décision du médecin (accepté/refusé)</span>
            </div>
            <button
              type="button"
              className={`switch${prefs.notif_email_rdv ? " on" : ""}`}
              onClick={() => togglePref("notif_email_rdv")}
              disabled={prefsSaving}
              aria-pressed={prefs.notif_email_rdv}
              aria-label="Activer ou désactiver les e-mails de rendez-vous"
            ></button>
          </div>
          <div className="set-row">
            <div>
              <b>Rappel 24 h avant</b>
              <span>E-mail de rappel envoyé la veille du rendez-vous</span>
            </div>
            <button
              type="button"
              className={`switch${prefs.notif_email_rappel ? " on" : ""}`}
              onClick={() => togglePref("notif_email_rappel")}
              disabled={prefsSaving}
              aria-pressed={prefs.notif_email_rappel}
              aria-label="Activer ou désactiver les e-mails de rappel"
            ></button>
          </div>
        </div>

        <div className="card">
          <h3>🛡️ Sécurité</h3>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pwdError && <div className="alert-error">{pwdError}</div>}
            <div className="field">
              <label htmlFor="mot_de_passe_actuel">Mot de passe actuel</label>
              <input
                id="mot_de_passe_actuel"
                type="password"
                className="input"
                value={pwdForm.mot_de_passe_actuel}
                onChange={handlePwdChange("mot_de_passe_actuel")}
              />
              {pwdFieldErrors.mot_de_passe_actuel && (
                <span className="field-error">{pwdFieldErrors.mot_de_passe_actuel[0]}</span>
              )}
            </div>
            <div className="field">
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                id="password"
                type="password"
                className="input"
                value={pwdForm.password}
                onChange={handlePwdChange("password")}
              />
              {pwdFieldErrors.password && <span className="field-error">{pwdFieldErrors.password[0]}</span>}
            </div>
            <div className="field">
              <label htmlFor="password_confirmation">Confirmer le nouveau mot de passe</label>
              <input
                id="password_confirmation"
                type="password"
                className="input"
                value={pwdForm.password_confirmation}
                onChange={handlePwdChange("password_confirmation")}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwdSaving} style={{ width: "fit-content" }}>
              {pwdSaving ? "Modification…" : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
