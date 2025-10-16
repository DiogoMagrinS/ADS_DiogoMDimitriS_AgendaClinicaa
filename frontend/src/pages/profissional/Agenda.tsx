import { useEffect, useState } from "react";
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import AgendamentoCard from "./components/AgendamentoCard";
import PacienteModal from "./components/PacienteModal";

interface Agendamento {
  id: number;
  data: string;
  hora: string;
  status: string;
  paciente: {
    nome: string;
    email: string;
  };
}

export default function Agenda() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Agendamento | null>(null);

  useEffect(() => {
    async function carregarAgendamentos() {
      try {
        setLoading(true);
        const res = await api.get(`/agendamentos/profissional/me?data=${dataSelecionada}`);
        setAgendamentos(res.data);
      } catch (err) {
        console.error("Erro ao carregar agendamentos", err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) {
      carregarAgendamentos();
    }
  }, [user, dataSelecionada]);

  async function carregarAgendamentos() {
    try {
      setLoading(true);
      const res = await api.get(`/agendamentos/profissional/me?data=${dataSelecionada}`);
      setAgendamentos(res.data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos", err);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(id: number, status: string) {
    try {
      await api.put(`/agendamentos/${id}/status`, { status });
      carregarAgendamentos();
    } catch (err) {
      console.error("Erro ao atualizar status", err);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Agenda</h1>
            <p className="text-sm text-gray-600 mt-1">Gerencie os atendimentos do dia.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Carregando...</div>
        ) : agendamentos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Nenhum agendamento para esta data.</div>
        ) : (
          <div className="space-y-3">
            {agendamentos.map((a) => (
              <AgendamentoCard
                key={a.id}
                agendamento={a}
                onAtualizarStatus={atualizarStatus}
                onVerPaciente={() => setPacienteSelecionado(a)}
              />
            ))}
          </div>
        )}

        {pacienteSelecionado && (
          <PacienteModal
            agendamento={pacienteSelecionado}
            onClose={() => setPacienteSelecionado(null)}
          />
        )}
      </div>
    </div>
  );
}
