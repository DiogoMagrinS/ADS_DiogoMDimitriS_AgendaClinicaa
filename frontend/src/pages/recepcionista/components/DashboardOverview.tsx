// src/pages/recepcionista/components/DashboardOverview.tsx
import { useEffect, useState } from "react";
import api from "../../../services/api";

interface DashboardResumo {
  totalUsuarios: number;
  totalPacientes: number;
  totalProfissionais: number;
  totalAgendamentosHoje: number;
  canceladosMes: number;
}

export default function DashboardOverview() {
  const [dados, setDados] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarResumo() {
      try {
        const res = await api.get("/recepcionista/dashboard-resumo");
        setDados(res.data);
      } catch (err) {
        console.error("Erro ao carregar resumo:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarResumo();
  }, []);

  if (loading) return <p className="text-gray-500">Carregando dados...</p>;
  if (!dados) return <p className="text-red-500">Erro ao carregar resumo.</p>;

  const cards = [
    { label: "Usuários", value: dados.totalUsuarios },
    { label: "Pacientes", value: dados.totalPacientes },
    { label: "Profissionais", value: dados.totalProfissionais },
    { label: "Agendamentos Hoje", value: dados.totalAgendamentosHoje },
    { label: "Cancelados no Mês", value: dados.canceladosMes },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center">
          <span className="text-gray-600 text-sm">{card.label}</span>
          <span className="text-2xl font-bold text-blue-600">{card.value}</span>
        </div>
      ))}
    </div>
  );
}
