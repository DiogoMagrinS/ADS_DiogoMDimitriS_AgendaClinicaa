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
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md px-10 py-8">
        {/* Cabeçalho */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Painel do Recepcionista
        </h1>

        {/* Navegação */}
        <div className="flex items-center space-x-3 mb-8">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border shadow-sm ${
                tab === key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Linha divisória sutil abaixo das abas */}
        <div className="border-b border-gray-200 mb-8" />

        {/* Conteúdo dinâmico centralizado */}
        <div className="transition-all duration-300">
          {tab === "overview" && <DashboardOverview />}
          {tab === "usuarios" && <UsuariosManager />}
          {tab === "especialidades" && <EspecialidadesManager />}
          {tab === "agendamentos" && <AgendamentosManager />}
        </div>
      </div>
    </div>
  );
}
