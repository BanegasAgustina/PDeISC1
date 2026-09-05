// Router contiene las rutas y AuthProvider hace disponible la sesión a todas ellas.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PetsPage from "./pages/PetsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import "./App.css";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas: no requieren JWT. */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          {/* Layout y todas sus rutas hijas exigen sesión válida. */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/mascotas" element={<PetsPage />} />
            <Route path="/turnos" element={<AppointmentsPage />} />
            {/* Esta ruta suma una comprobación de rol Administrador. */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="Administrador">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Cualquier URL desconocida vuelve al inicio. */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
