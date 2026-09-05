import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PetsPage from './pages/PetsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientsPage from './pages/PatientsPage';
import ConsultasPage from './pages/ConsultasPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPetsPage from './pages/admin/AdminPetsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />

            <Route
              path="/mascotas"
              element={
                <ProtectedRoute role="Cliente">
                  <PetsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes"
              element={
                <ProtectedRoute role="Veterinario">
                  <PatientsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/turnos"
              element={
                <ProtectedRoute role={['Cliente', 'Veterinario']}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/consultas"
              element={
                <ProtectedRoute role="Veterinario">
                  <ConsultasPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* RUTAS ADMINISTRATIVAS */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="Administrador">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute role="Administrador">
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/mascotas"
              element={
                <ProtectedRoute role="Administrador">
                  <AdminPetsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/turnos"
              element={
                <ProtectedRoute role="Administrador">
                  <AdminAppointmentsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
