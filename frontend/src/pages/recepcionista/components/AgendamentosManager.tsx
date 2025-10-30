import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../services/api";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Stethoscope,
} from "lucide-react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Especialidade {
  id: number;
  nome: string;
}

interface Profissional {
  id: number;
  usuario: Usuario;
  especialidade: Especialidade;
}

interface Agendamento {
  id: number;
  data: string;
  status: "AGENDADO" | "CONFIRMADO" | "CANCELADO";
  profissional?: Profissional | null;
  paciente?: Usuario | null;
}

export default function AgendamentosManager() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filtro, setFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<"TODOS" | "AGENDADO" | "CONFIRMADO" | "CANCELADO">("TODOS");
  const [loading, setLoading] = useState(true);

  // 🔹 Carregar agendamentos
  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const res = await api.get("/recepcionista/agendamentos");
        setAgendamentos(res.data);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgendamentos();
  }, []);

  // 🔹 Atualizar status (confirmar, cancelar, reativar)
  const atualizarStatus = async (id: number, status: "AGENDADO" | "CONFIRMADO" | "CANCELADO") => {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status });
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // 🔹 Aplicar filtros
  const agendamentosFiltrados = agendamentos.filter((a) => {
    const termo = filtro.toLowerCase();
    const nomeProf = a.profissional?.usuario?.nome?.toLowerCase() ?? "";
    const nomePac = a.paciente?.nome?.toLowerCase() ?? "";
    const statusOk = statusFiltro === "TODOS" || a.status === statusFiltro;
    return statusOk && (nomeProf.includes(termo) || nomePac.includes(termo));
  });

  // 🔹 Contadores por status
  const totalAgendados = agendamentos.filter((a) => a.status === "AGENDADO").length;
  const totalConfirmados = agendamentos.filter((a) => a.status === "CONFIRMADO").length;
  const totalCancelados = agendamentos.filter((a) => a.status === "CANCELADO").length;

  // ---------------------------
  // Renderização
  // ---------------------------
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Carregando agendamentos...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" /> Agendamentos
        </h1>

        {/* Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-400">
            <p className="text-sm text-gray-500">Agendados</p>
            <p className="text-2xl font-bold text-gray-800">{totalAgendados}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Confirmados</p>
            <p className="text-2xl font-bold text-gray-800">{totalConfirmados}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Cancelados</p>
            <p className="text-2xl font-bold text-gray-800">{totalCancelados}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por paciente ou profissional..."
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          <select
            value={statusFiltro}
            onChange={(e) =>
              setStatusFiltro(e.target.value as "TODOS" | "AGENDADO" | "CONFIRMADO" | "CANCELADO")
            }
            className="w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Todos</option>
            <option value="AGENDADO">Agendados</option>
            <option value="CONFIRMADO">Confirmados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
        </div>

        {/* Lista de agendamentos */}
        {agendamentosFiltrados.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Nenhum agendamento encontrado.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agendamentosFiltrados.map((a) => {
              const dataObj = new Date(a.data);
              const dataFormatada = dataObj.toLocaleDateString();
              const horaFormatada = dataObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <motion.div
                  key={a.id}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow hover:shadow-lg transition"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-gray-800">
                      {a.profissional?.usuario?.nome ?? "—"}
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        a.status === "AGENDADO"
                          ? "bg-yellow-100 text-yellow-700"
                          : a.status === "CONFIRMADO"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Stethoscope className="w-4 h-4 text-blue-500" />
                    {a.profissional?.especialidade?.nome ?? "Sem especialidade"}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <User className="w-4 h-4 text-purple-500" />
                    {a.paciente?.nome ?? "Paciente não informado"}
                  </p>
                  <p className="text-xs text-gray-500 ml-5">
                    {a.paciente?.email ?? "—"}
                  </p>

                  <div className="mt-3 text-sm text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" /> {dataFormatada}
                    <Clock className="w-4 h-4 text-gray-500 ml-2" /> {horaFormatada}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.status === "AGENDADO" && (
                      <>
                        <button
                          onClick={() => atualizarStatus(a.id, "CONFIRMADO")}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" /> Confirmar
                        </button>
                        <button
                          onClick={() => atualizarStatus(a.id, "CANCELADO")}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" /> Cancelar
                        </button>
                      </>
                    )}

                    {a.status === "CANCELADO" && (
                      <button
                        onClick={() => atualizarStatus(a.id, "AGENDADO")}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        <RefreshCw className="w-4 h-4" /> Reativar
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
