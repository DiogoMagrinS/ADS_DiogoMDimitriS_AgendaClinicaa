// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeusAgendamentos from './pages/paciente/MeusAgendamentos';
import NovoAgendamento from './pages/paciente/NovoAgendamento';
import AgendaProfissional from './pages/profissional/Agenda';
import DashboardRecepcionista from "./pages/recepcionista/DashboardRecepcionista";
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/profissional"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/paciente"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/paciente/agendamentos"
            element={
              <PrivateRoute>
                <MeusAgendamentos />
              </PrivateRoute>
            }
          />
          <Route
          path="/paciente/novo-agendamento"
          element={
            <PrivateRoute>
              <NovoAgendamento />
            </PrivateRoute>
          }
/>        <Route
            path="/profissional/agenda"
            element={
              <PrivateRoute>
                <AgendaProfissional />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard/recepcionista" element={<DashboardRecepcionista />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
