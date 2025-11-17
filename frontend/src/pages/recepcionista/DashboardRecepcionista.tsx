// src/pages/recepcionista/DashboardRecepcionista.tsx
import { useState } from "react";
import DashboardOverview from "./components/DashboardOverview";
import UsuariosManager from "./components/UsuariosManager";
import EspecialidadesManager from "./components/EspecialidadesManager";
import AgendamentosManager from "./components/AgendamentosManager";
import GlassPage from "../../components/GlassPage";

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
    <GlassPage
      maxWidthClass="w-full"
      contentClassName="glass-content"
      className="pb-10"
      withCard={false}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[var(--ink)]">Painel do Recepcionista</h1>

        <div className="flex items-center flex-wrap gap-3">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border shadow-sm ${
                tab === key
                  ? "bg-[var(--sand-500)] text-white border-[var(--sand-500)] shadow-md"
                  : "bg-white/90 text-[var(--text-muted)] border-white/40 hover:bg-[var(--sand-200)] hover:text-[var(--sand-600)] backdrop-blur-sm"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="border-b border-[var(--sand-200)]" />

        <div className="transition-all duration-300 bg-white/90 rounded-2xl shadow-sm p-6 backdrop-blur-sm">
          {tab === "overview" && <DashboardOverview />}
          {tab === "usuarios" && <UsuariosManager />}
          {tab === "especialidades" && <EspecialidadesManager />}
          {tab === "agendamentos" && <AgendamentosManager />}
        </div>
      </div>
    </GlassPage>
  );
}
