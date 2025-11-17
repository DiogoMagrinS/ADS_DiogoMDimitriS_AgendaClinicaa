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
import GlassPage from "../../components/GlassPage";

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
    <GlassPage
      maxWidthClass="w-full"
      contentClassName="glass-content"
      className="pb-12"
      withCard={false}
    >
      <div className="space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--ink)] flex items-center gap-3">
              <Stethoscope className="w-7 h-7 text-[var(--sand-600)]" />
              Bem-vindo, Dr(a). {user?.nome}
            </h1>
            <p className="text-[var(--text-muted)] mt-1">Visão geral dos seus atendimentos</p>
          </div>

          <button
            onClick={fetchAgendamentos}
            className="flex items-center gap-2 bg-white/90 border border-white/40 px-3 py-2 rounded-lg shadow-sm hover:shadow transition backdrop-blur-sm text-[var(--ink)]"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Confirmados" value={confirmados} color="sage" icon={<CheckCircle />} />
            <StatCard title="Atendidos" value={atendidos} color="sand" icon={<Activity />} />
            <StatCard title="Pendentes" value={pendentes} color="clay" icon={<TrendingUp />} />
            <StatCard title="Cancelados" value={cancelados} color="terracotta" icon={<XCircle />} />
          </div>

          <div className="bg-white/90 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center border border-white/40 backdrop-blur-sm">
            <h3 className="text-[var(--text-muted)] font-medium mb-3">Comparecimento</h3>
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-[var(--sand-200)]/60" />
              <div
                className="absolute inset-0 rounded-full origin-center rotate-[-90deg]"
                style={{
                  background: `conic-gradient(
                    #a5c4a1 ${((confirmados / somaTotal) * 360) || 0}deg,
                    #c9b08c ${((confirmados + atendidos) / somaTotal) * 360 || 0}deg,
                    #dfc4a7 ${((confirmados + atendidos + pendentes) / somaTotal) * 360 || 0}deg,
                    #d89a8c 360deg
                  )`,
                }}
              ></div>
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center text-lg font-semibold text-[var(--ink)]">
                {taxaComparecimento}%
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/90 rounded-2xl p-6 shadow-sm border border-white/40 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[var(--sand-600)]" /> Próximos atendimentos
          </h2>

          {proximos.length === 0 ? (
            <p className="text-[var(--text-muted)]">Nenhum atendimento futuro próximo.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {proximos.map((a) => (
                <div key={a.id} className="p-4 border border-[var(--sand-200)] rounded-xl shadow-sm hover:shadow-md transition bg-white">
                  <p className="font-medium text-[var(--ink)]">{a.paciente?.nome || "—"}</p>
                  <p className="text-sm text-[var(--text-muted)]">{a.especialidade?.nome || ""}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    {new Date(a.data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleMudarStatus(a.id, "CONFIRMADO")}
                      className="flex-1 bg-[var(--sage-300)] text-[var(--sand-700)] py-1 rounded-md text-sm hover:bg-[var(--sage-100)]"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleMudarStatus(a.id, "FINALIZADO")}
                      className="bg-[var(--sand-500)] text-white text-sm px-3 py-1 rounded-lg transition hover:bg-[var(--sand-600)]"
                    >
                      Finalizar
                    </button>
                    <button
                      onClick={() => handleMudarStatus(a.id, "CANCELADO")}
                      className="flex-1 bg-[#e6b8ae] text-[#7d4b43] py-1 rounded-md text-sm hover:bg-[#d7a79d]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white/90 rounded-2xl p-6 shadow-sm border border-white/40 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[var(--sand-600)]" /> Todos os agendamentos
          </h2>

          {agendamentos.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center">Nenhum agendamento encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {agendamentos.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-[var(--sand-200)] bg-white hover:bg-[var(--sand-50)] transition p-5 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[var(--ink)]">
                        {a.paciente?.nome || "Paciente não identificado"}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">{a.especialidade?.nome || "—"}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        a.status === "CONFIRMADO"
                          ? "bg-[var(--sage-100)] text-[var(--sand-600)]"
                          : a.status === "CANCELADO"
                          ? "bg-[#f8dcd6] text-[#a45a52]"
                          : a.status === "FINALIZADO"
                          ? "bg-[var(--sand-200)] text-[var(--sand-700)]"
                          : "bg-[#f5eadc] text-[var(--sand-600)]"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-[var(--text-muted)] space-y-1">
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

                  <div className="mt-5 flex flex-wrap justify-between items-center gap-2">
                    <button
                      onClick={() => handleMudarStatus(a.id, "CONFIRMADO")}
                      className="bg-[var(--sage-300)] text-[var(--sand-700)] text-sm px-3 py-1 rounded-lg transition hover:bg-[var(--sage-100)]"
                    >
                      Confirmar
                    </button>

                    <button
                      onClick={() => handleMudarStatus(a.id, "CANCELADO")}
                      className="bg-[#e6b8ae] text-[#7d4b43] text-sm px-3 py-1 rounded-lg transition hover:bg-[#d7a79d]"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={() => handleMudarStatus(a.id, "FINALIZADO")}
                      className="bg-[var(--sand-500)] text-white text-sm px-3 py-1 rounded-lg transition hover:bg-[var(--sand-600)]"
                    >
                      Finalizar
                    </button>

                    {a.status === "FINALIZADO" && (
                      <button
                        onClick={async () => {
                          if (confirm("Deseja realmente excluir este agendamento?")) {
                            try {
                              await api.delete(`/agendamentos/${a.id}`);
                              setAgendamentos((prev) => prev.filter((ag) => ag.id !== a.id));
                              toast.success("Agendamento excluído com sucesso!");
                            } catch (error) {
                              console.error(error);
                              toast.error("Erro ao excluir agendamento.");
                            }
                          }
                        }}
                        className="bg-[#a8a29e] text-white text-sm px-3 py-1 rounded-lg transition hover:bg-[#8a837f]"
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
    </GlassPage>
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
    sage: "bg-[#9fb59a]",
    sand: "bg-[#caa57a]",
    clay: "bg-[#e0c3a5]",
    terracotta: "bg-[#d89a8c]",
  }[color || "sand"];

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
