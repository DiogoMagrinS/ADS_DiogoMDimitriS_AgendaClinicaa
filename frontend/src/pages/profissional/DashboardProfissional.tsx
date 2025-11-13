import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { getUserFromToken } from "../../utils/getUserFromToken";
import { toast } from "react-toastify";
import {
  CalendarDays,
  RefreshCw,
  Stethoscope,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
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

  // Buscar agendamentos do profissional
  const fetchAgendamentos = async () => {
    try {
      setRefreshing(true);
      const response = await api.get("/agendamentos/me/profissional");
      setAgendamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  // Estatísticas
  const total = agendamentos.length;
  const confirmados = agendamentos.filter(a => a.status === "CONFIRMADO").length;
  const cancelados = agendamentos.filter(a => a.status === "CANCELADO").length;
  const atendidos = agendamentos.filter(a => a.status === "ATENDIDO").length;
  const pendentes = total - confirmados - cancelados - atendidos;
  const taxaComparecimento = total > 0 ? Math.round(((confirmados + atendidos) / total) * 100) : 0;

  const proximos = agendamentos
    .filter(a => new Date(a.data) > new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const handleMudarStatus = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status: novoStatus });
      setAgendamentos(prev => prev.map(a => (a.id === id ? { ...a, status: novoStatus } : a)));
      toast.success("Status atualizado!");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status.");
    }
  };

  // Gráfico circular simples
  const graficoPercentuais = [
    { cor: "bg-green-500", valor: confirmados },
    { cor: "bg-indigo-500", valor: atendidos },
    { cor: "bg-yellow-500", valor: pendentes },
    { cor: "bg-red-500", valor: cancelados },
  ];
  const somaTotal = graficoPercentuais.reduce((acc, s) => acc + s.valor, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
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
          className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm hover:shadow transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </header>

      {/* Estatísticas + Gráfico */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-10">
        <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Confirmados" value={confirmados} color="green" icon={<CheckCircle />} />
          <StatCard title="Atendidos" value={atendidos} color="indigo" icon={<Activity />} />
          <StatCard title="Pendentes" value={pendentes} color="yellow" icon={<TrendingUp />} />
          <StatCard title="Cancelados" value={cancelados} color="red" icon={<XCircle />} />
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
          <h3 className="text-gray-700 font-medium mb-3">Comparecimento</h3>
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-gray-200" />
            <div
              className="absolute inset-0 rounded-full origin-center rotate-[-90deg]"
              style={{
                background: `conic-gradient(
                  #22c55e ${((confirmados / somaTotal) * 360) || 0}deg,
                  #6366f1 ${((confirmados + atendidos) / somaTotal) * 360 || 0}deg,
                  #eab308 ${((confirmados + atendidos + pendentes) / somaTotal) * 360 || 0}deg,
                  #ef4444 360deg
                )`,
              }}
            ></div>
            <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
              {taxaComparecimento}%
            </div>
          </div>
        </div>
      </section>

      {/* Próximos atendimentos */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" /> Próximos atendimentos
        </h2>

        {proximos.length === 0 ? (
          <p className="text-gray-500">Nenhum atendimento futuro próximo.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proximos.map((a) => (
              <div key={a.id} className="p-4 border rounded-xl shadow-sm hover:shadow-md transition bg-gray-50">
                <p className="font-medium text-gray-800">{a.paciente?.nome || "—"}</p>
                <p className="text-sm text-gray-500">{a.especialidade?.nome || ""}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {new Date(a.data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleMudarStatus(a.id, "CONFIRMADO")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-md text-sm"
                  >
                    Confirmar
                  </button>
                  <button
                  onClick={() => handleMudarStatus(a.id, "FINALIZADO")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-lg transition"
                >
                  Finalizar
                </button>
                  <button
                    onClick={() => handleMudarStatus(a.id, "CANCELADO")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-md text-sm"
                  >
                    Cancelar
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Todos os Agendamentos */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" /> Todos os agendamentos
        </h2>

        {agendamentos.length === 0 ? (
          <p className="text-gray-500 text-center">Nenhum agendamento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {agendamentos.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-white transition p-5 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                {/* Cabeçalho */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {a.paciente?.nome || "Paciente não identificado"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.especialidade?.nome || "—"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      a.status === "CONFIRMADO"
                        ? "bg-green-100 text-green-700"
                        : a.status === "CANCELADO"
                        ? "bg-red-100 text-red-700"
                        : a.status === "FINALIZADO"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                {/* Informações */}
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(a.data).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  {a.paciente?.email && (
                    <p>
                      <strong>Email:</strong> {a.paciente.email}
                    </p>
                  )}
                  {a.observacoes && (
                    <p>
                      <strong>Obs:</strong> {a.observacoes}
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="mt-5 flex flex-wrap justify-between items-center gap-2">
                  <button
                    onClick={() => handleMudarStatus(a.id, "CONFIRMADO")}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-lg transition"
                  >
                    Confirmar
                  </button>

                  <button
                    onClick={() => handleMudarStatus(a.id, "CANCELADO")}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition"
                  >
                    Cancelar
                  </button>

                  <button
                  onClick={() => handleMudarStatus(a.id, "FINALIZADO")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-lg transition"
                >
                  Finalizar
                </button>

                  {/* Só aparece se o agendamento estiver FINALIZADO */}
                  {a.status === "FINALIZADO" && (
                    <button
                      onClick={async () => {
                        if (confirm("Deseja realmente excluir este agendamento?")) {
                          try {
                            await api.delete(`/agendamentos/${a.id}`);
                            setAgendamentos((prev) =>
                              prev.filter((ag) => ag.id !== a.id)
                            );
                            toast.success("Agendamento excluído com sucesso!");
                          } catch (error) {
                            console.error(error);
                            toast.error("Erro ao excluir agendamento.");
                          }
                        }
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded-lg transition"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default DashboardProfissional;

// Subcomponente
const StatCard = ({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
}) => {
  const bg = {
    green: "bg-green-600",
    indigo: "bg-indigo-600",
    yellow: "bg-yellow-500",
    red: "bg-red-600",
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
