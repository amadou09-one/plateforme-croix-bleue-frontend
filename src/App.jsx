import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PatientLayout from "./layouts/PatientLayout.jsx";
import PatientDashboard from "./pages/patient/Dashboard.jsx";
import PatientBook from "./pages/patient/Book.jsx";
import PatientAppointments from "./pages/patient/Appointments.jsx";
import PatientProfile from "./pages/patient/Profile.jsx";
import PatientSettings from "./pages/patient/Settings.jsx";
import MedecinLayout from "./layouts/MedecinLayout.jsx";
import MedecinDashboard from "./pages/medecin/Dashboard.jsx";
import MedecinDisponibilites from "./pages/medecin/Disponibilites.jsx";
import MedecinPatients from "./pages/medecin/Patients.jsx";
import MedecinPatientDetail from "./pages/medecin/PatientDetail.jsx";
import MedecinProfil from "./pages/medecin/Profil.jsx";
import MedecinParametres from "./pages/medecin/Parametres.jsx";
import SecretaireDashboard from "./pages/secretaire/Dashboard.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route
        path="/patient"
        element={
          <ProtectedRoute roles={["patient"]}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="book" element={<PatientBook />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="parametres" element={<PatientSettings />} />
      </Route>
      <Route
        path="/medecin"
        element={
          <ProtectedRoute roles={["medecin"]}>
            <MedecinLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MedecinDashboard />} />
        <Route path="disponibilites" element={<MedecinDisponibilites />} />
        <Route path="patients" element={<MedecinPatients />} />
        <Route path="patients/:id" element={<MedecinPatientDetail />} />
        <Route path="profil" element={<MedecinProfil />} />
        <Route path="parametres" element={<MedecinParametres />} />
      </Route>
      <Route
        path="/secretaire"
        element={
          <ProtectedRoute roles={["secretaire"]}>
            <SecretaireDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
