import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { getUserFromToken } from "../../utils/getUserFromToken";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Stethoscope,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  X,
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
  const [modalAnotacoesAberto, setModalAnotacoesAberto] = useState(false);
  const [agendamentoParaFinalizar, setAgendamentoParaFinalizar] = useState<number | null>(null);
  const [anotacoes, setAnotacoes] = useState("");


  // Buscar agendamentos do profissional
  const fetchAgendamentos = async () => {
    try {
      const response = await api.get("/agendamentos/me/profissional");
      setAgendamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos.");
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
    .filter(a => new Date(a.data) > new Date() && a.status !== 'CANCELADO' && a.status !== 'FINALIZADO')

    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const abrirModalAnotacoes = (id: number) => {
    setAgendamentoParaFinalizar(id);
    setAnotacoes("");
    setModalAnotacoesAberto(true);
  };

  const fecharModalAnotacoes = () => {
    setModalAnotacoesAberto(false);
    setAgendamentoParaFinalizar(null);
    setAnotacoes("");
  };

  const finalizarComAnotacoes = async () => {
    if (!agendamentoParaFinalizar) return;

    try {
      // Primeiro salva as anotações se houver
      if (anotacoes && anotacoes.trim()) {
        await api.patch(`/agendamentos/${agendamentoParaFinalizar}/observacoes`, {
          observacoes: anotacoes.trim()
        });
      }

      // Depois finaliza o agendamento
      await api.patch(`/agendamentos/${agendamentoParaFinalizar}/status`, { status: "FINALIZADO" });
      
      // Remove da lista
      setAgendamentos(prev => prev.filter(a => a.id !== agendamentoParaFinalizar));
      toast.success(anotacoes.trim() ? "Agendamento finalizado com anotações!" : "Agendamento finalizado com sucesso!");
      fecharModalAnotacoes();
    } catch (err: any) {
      console.error("Erro ao finalizar agendamento:", err);
      toast.error(err.response?.data?.erro || "Erro ao finalizar agendamento.");
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
        <header className="bg-gradient-to-r from-[var(--sage-100)] to-[var(--sand-100)] border border-[var(--sage-200)] rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--sand-300)] to-[var(--sand-500)] flex items-center justify-center shadow-md ring-4 ring-white/50">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[var(--ink)] mb-2">
                Bem-vindo, Dr(a). {user?.nome} 👋
              </h1>
              <p className="text-[var(--text-muted)] text-base leading-relaxed">
                Visão geral dos seus atendimentos
              </p>
            </div>
          </div>
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
                      onClick={() => abrirModalAnotacoes(a.id)}
                      className="flex-1 bg-[var(--sand-500)] text-white text-sm px-3 py-1 rounded-lg transition hover:bg-[var(--sand-600)]"

                    >
                      Finalizar
                    </button>
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
                      className="flex-1 bg-[#a8a29e] text-white text-sm px-3 py-1 rounded-lg transition hover:bg-[#8a837f]"
                    >
                      Excluir
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
          {agendamentos.filter(a => a.status !== 'CANCELADO' && a.status !== 'FINALIZADO').length === 0 ? (
            <p className="text-[var(--text-muted)] text-center">Nenhum agendamento encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {agendamentos.filter(a => a.status !== 'CANCELADO' && a.status !== 'FINALIZADO').map((a) => (
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
                      onClick={() => abrirModalAnotacoes(a.id)}
                      className="flex-1 bg-[var(--sand-500)] text-white text-sm px-3 py-1 rounded-lg transition hover:bg-[var(--sand-600)]"
                    >
                      Finalizar
                    </button>
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
                      className="flex-1 bg-[#a8a29e] text-white text-sm px-3 py-1 rounded-lg transition hover:bg-[#8a837f]"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>    
        {/* Modal de Anotações */}
        {modalAnotacoesAberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-[var(--sand-200)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[var(--ink)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--sand-600)]" />
                  Anotações do Atendimento
                </h3>
                <button
                  onClick={fecharModalAnotacoes}
                  className="text-[var(--text-muted)] hover:text-[var(--ink)] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-[var(--text-muted)] mb-4">
                Adicione anotações sobre o atendimento. Estas informações serão visíveis para o paciente.
              </p>

              <textarea
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
                placeholder="Ex: Solicito exame de próstata no consultório tal até o dia tal..."
                className="w-full h-40 p-3 border border-[var(--sand-300)] rounded-lg focus:ring-2 focus:ring-[var(--sand-400)] focus:border-[var(--sand-400)] resize-none"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={fecharModalAnotacoes}
                  className="flex-1 px-4 py-2 border border-[var(--sand-300)] rounded-lg text-[var(--ink)] hover:bg-[var(--sand-100)] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={finalizarComAnotacoes}
                  className="flex-1 px-4 py-2 bg-[var(--sand-500)] text-white rounded-lg hover:bg-[var(--sand-600)] transition"
                >
                  Finalizar Atendimento
                </button>
              </div>
            </div>
          </div>
        )}
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
