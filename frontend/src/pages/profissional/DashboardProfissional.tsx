import React, { useEffect, useState } from "react"; // removido useMemo
import api from "../../services/api";
import { getUserFromToken } from "../../utils/getUserFromToken";
import { toast } from "react-toastify";
import {
  CalendarDays,
  User,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  Stethoscope,
  Activity,
  TrendingUp,
  Percent,
} from "lucide-react";

interface DecodedUser {
  id: number;
  nome?: string;
  email?: string;
  tipo?: string;
}

interface Paciente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

interface AgendamentoRaw {
  id: number;
  data: string;
  status: string;
  paciente?: Paciente;
  especialidade?: { nome?: string };
  observacoes?: string | null;
}

const DashboardProfissional: React.FC = () => {
  const user = getUserFromToken() as DecodedUser | null;
  const [agendamentos, setAgendamentos] = useState<AgendamentoRaw[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);

  // ✅ Nova função fetchAgendamentos
  const fetchAgendamentos = async () => {
    try {
      const response = await api.get("/agendamentos/me/profissional");
      setAgendamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos do profissional:", error);
      toast.error("Erro ao carregar agendamentos.");
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Novo useEffect simples
  useEffect(() => {
    fetchAgendamentos();
  }, []); // sem dependências adicionais

  // ✅ Estatísticas
  const agList = agendamentos;
  const total = agList.length;
  const confirmados = agList.filter((a) => a.status === "CONFIRMADO").length;
  const cancelados = agList.filter((a) => a.status === "CANCELADO").length;
  const atendidos = agList.filter((a) => a.status === "ATENDIDO").length;
  const pendentes = total - confirmados - cancelados - atendidos;
  const taxaComparecimento = total > 0 ? Math.round(((confirmados + atendidos) / total) * 100) : 0;

  const proximos = agList
    .filter((a) => new Date(a.data) > new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const handleMudarStatus = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status: novoStatus });
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: novoStatus } : a))
      );
      toast.success("Status atualizado.");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            Bem-vindo, Dr(a). {user?.nome}
          </h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus atendimentos</p>
        </div>

        <button
          onClick={fetchAgendamentos}
          className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm hover:shadow"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </header>

      {/* Estatísticas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total" value={total} icon={<CalendarDays />} color="blue" />
        <StatCard title="Confirmados" value={confirmados} icon={<CheckCircle />} color="green" />
        <StatCard title="Atendidos" value={atendidos} icon={<Activity />} color="indigo" />
        <StatCard title="Pendentes" value={pendentes} icon={<TrendingUp />} color="yellow" />
        <StatCard title="Cancelados" value={cancelados} icon={<XCircle />} color="red" />
        <StatCard title="Comparecimento (%)" value={`${taxaComparecimento}%`} icon={<Percent />} color="purple" />
      </section>

      {/* Próximos atendimentos */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" /> Próximos atendimentos
        </h2>

        {proximos.length === 0 ? (
          <p className="text-gray-500">Nenhum atendimento futuro próximo.</p>
        ) : (
          <ul className="space-y-3">
            {proximos.map((a) => (
              <li key={a.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-800">{a.paciente?.nome || "—"}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {a.paciente?.email || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{(a.data)}</p>
                    <p className="text-xs text-gray-500">{new Date(a.data).toLocaleDateString("pt-BR")}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMudarStatus(a.id, "ATENDIDO")}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Marcar como atendido"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMudarStatus(a.id, "CONFIRMADO")}
                      className="text-green-600 hover:text-green-800"
                      title="Confirmar"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMudarStatus(a.id, "CANCELADO")}
                      className="text-red-600 hover:text-red-800"
                      title="Cancelar"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lista completa */}
      <section className="space-y-6">
        {agendamentos.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum agendamento encontrado.</p>
        ) : (
          agendamentos.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">{a.paciente?.nome || "—"}</p>
                    <p className="text-sm text-gray-500">{a.especialidade?.nome || ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{(a.data)}</p>
                  <p className="text-xs text-gray-500">{new Date(a.data).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {selectedPaciente && (
        <PacienteModal paciente={selectedPaciente} onClose={() => setSelectedPaciente(null)} />
      )}
    </div>
  );
};

export default DashboardProfissional;

// Subcomponentes
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => {
  const bg = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-500",
    red: "bg-red-600",
    indigo: "bg-indigo-600",
    purple: "bg-purple-600",
  }[color || "blue"];

  return (
    <div className={`${bg} text-white rounded-xl p-4 flex items-center gap-3 shadow-md`}>
      <div className="p-2 bg-white/10 rounded">{icon}</div>
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

const PacienteModal = ({
  paciente,
  onClose,
}: {
  paciente: Paciente;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        Fechar
      </button>
      <h3 className="text-lg font-semibold mb-4">Detalhes do Paciente</h3>
      <div className="space-y-3 text-gray-700">
        <p>
          <strong>Nome:</strong> {paciente.nome}
        </p>
        <p>
          <strong>Email:</strong> {paciente.email || "-"}
        </p>
        <p>
          <strong>Telefone:</strong> {paciente.telefone || "-"}
        </p>
      </div>
    </div>
  </div>
);
