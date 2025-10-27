// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AgendaProfissional from './pages/profissional/Agenda';
import DashboardRecepcionista from "./pages/recepcionista/DashboardRecepcionista";
import DashboardPaciente from "./pages/paciente/DashboardPaciente"; // ✅ import novo
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Rota padrão */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard do PROFISSIONAL */}
          <Route
            path="/dashboard/profissional"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Dashboard do PACIENTE (substitui MeusAgendamentos e NovoAgendamento) */}
          <Route
            path="/dashboard/paciente"
            element={
              <PrivateRoute>
                <DashboardPaciente />
              </PrivateRoute>
            }
          />

          {/* Dashboard do RECEPCIONISTA */}
          <Route
            path="/dashboard/recepcionista"
            element={
              <PrivateRoute>
                <DashboardRecepcionista />
              </PrivateRoute>
            }
          />

          {/* Agenda do PROFISSIONAL */}
          <Route
            path="/profissional/agenda"
            element={
              <PrivateRoute>
                <AgendaProfissional />
              </PrivateRoute>
            }
          />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
