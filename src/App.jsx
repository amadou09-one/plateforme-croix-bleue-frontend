import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PatientLayout from "./layouts/PatientLayout.jsx";
import PatientDashboard from "./pages/patient/Dashboard.jsx";
import PatientBook from "./pages/patient/Book.jsx";
import PatientAppointments from "./pages/patient/Appointments.jsx";
import MedecinDashboard from "./pages/medecin/Dashboard.jsx";
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
      </Route>
      <Route
        path="/medecin"
        element={
          <ProtectedRoute roles={["medecin"]}>
            <MedecinDashboard />
          </ProtectedRoute>
        }
      />
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
