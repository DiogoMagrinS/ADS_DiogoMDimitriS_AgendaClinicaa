// src/pages/recepcionista/DashboardRecepcionista.tsx
import { useState } from "react";
import DashboardOverview from "./components/DashboardOverview";
import UsuariosManager from "./components/UsuariosManager";
import EspecialidadesManager from "./components/EspecialidadesManager";
import AgendamentosManager from "./components/AgendamentosManager";

type TabKey = "overview" | "usuarios" | "especialidades" | "agendamentos";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Visão Geral" },
  { key: "usuarios", label: "Usuários" },
  { key: "especialidades", label: "Especialidades" },
  { key: "agendamentos", label: "Agendamentos" },
];

export default function DashboardRecepcionista() {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel do Recepcionista</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === key ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo Dinâmico */}
      {tab === "overview" && <DashboardOverview />}
      {tab === "usuarios" && <UsuariosManager />}
      {tab === "especialidades" && <EspecialidadesManager />}
      {tab === "agendamentos" && <AgendamentosManager />}
    </div>
  );
}
