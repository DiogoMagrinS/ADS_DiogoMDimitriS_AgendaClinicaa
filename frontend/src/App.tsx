// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/Login";

// Dashboards
import DashboardProfissional from "./pages/profissional/DashboardProfissional";
import DashboardPaciente from "./pages/paciente/DashboardPaciente";
import DashboardRecepcionista from "./pages/recepcionista/DashboardRecepcionista";

// Componentes adicionais
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 🔹 Rota padrão */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* 🔹 Login */}
          <Route path="/login" element={<Login />} />

          {/* 🔹 Dashboard do PROFISSIONAL */}
          <Route
            path="/dashboard/profissional"
            element={
              <PrivateRoute>
                <DashboardProfissional />
              </PrivateRoute>
            }
          />

          {/* 🔹 Dashboard do PACIENTE */}
          <Route
            path="/dashboard/paciente"
            element={
              <PrivateRoute>
                <DashboardPaciente />
              </PrivateRoute>
            }
          />

          {/* 🔹 Dashboard do RECEPCIONISTA */}
          <Route
            path="/dashboard/recepcionista"
            element={
              <PrivateRoute>
                <DashboardRecepcionista />
              </PrivateRoute>
            }
          />

          {/* 🔹 Redirecionamento antigo → novo dashboard do profissional */}
          <Route
            path="/profissional/agenda"
            element={<Navigate to="/dashboard/profissional" replace />}
          />

        </Routes>

        {/* 🔹 Toast notifications globais */}
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
