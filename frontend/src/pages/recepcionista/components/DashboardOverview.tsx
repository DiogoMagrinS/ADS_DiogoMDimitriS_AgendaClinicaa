// src/pages/recepcionista/components/DashboardOverview.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, Calendar, Stethoscope, BriefcaseMedical } from "lucide-react";
import api from "../../../services/api";

// =========================
// Tipagens
// =========================
interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}

interface Profissional {
  id: number;
  usuarioId: number;
  especialidadeId: number;
  usuario: Usuario;
}

interface Especialidade {
  id: number;
  nome: string;
}

interface Agendamento {
  id: number;
  data: string;
  status: string;
  profissional: Profissional;
  paciente: Usuario;
}

// =========================
// Cores para gráficos
// =========================
const COLORS = ["#caa57a", "#9fb59a", "#e6c6a5", "#d89a8c"];

// =========================
// Componente principal
// =========================
export default function DashboardOverview() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usuariosRes, profRes, espRes, agRes] = await Promise.all([
          api.get<Usuario[]>("/recepcionista/usuarios"),
          api.get<Profissional[]>("/profissionais"),
          api.get<Especialidade[]>("/especialidades"),
          api.get<Agendamento[]>("/recepcionista/agendamentos"),
        ]);

        setUsuarios(usuariosRes.data);
        setProfissionais(profRes.data);
        setEspecialidades(espRes.data);
        setAgendamentos(agRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
        Carregando dados do painel...
      </div>
    );
  }

  // =========================
  // Métricas
  // =========================
  const totalUsuarios = usuarios.length;
  const totalProfissionais = profissionais.length;
  const totalEspecialidades = especialidades.length;
  const totalAgendamentos = agendamentos.length;

  const agendamentosPorStatus = [
    { name: "Agendado", value: agendamentos.filter((a) => a.status === "AGENDADO").length },
    { name: "Confirmado", value: agendamentos.filter((a) => a.status === "CONFIRMADO").length },
    { name: "Cancelado", value: agendamentos.filter((a) => a.status === "CANCELADO").length },
  ];

  const especialidadesMaisUsadas = especialidades.map((esp) => ({
    name: esp.nome,
    value: profissionais.filter((p) => p.especialidadeId === esp.id).length,
  }));

  // =========================
  // Renderização
  // =========================
  return (
    <div className="p-6 space-y-6 text-[var(--ink)]">
      <h1 className="text-3xl font-bold mb-4">
        Visão Geral da Clínica
      </h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Users className="w-8 h-8 text-[var(--sand-600)]" />,
            label: "Usuários",
            value: totalUsuarios,
            color: "from-[var(--sand-100)] to-[var(--sand-200)]",
          },
          {
            icon: <Stethoscope className="w-8 h-8 text-[var(--sand-600)]" />,
            label: "Profissionais",
            value: totalProfissionais,
            color: "from-[var(--sage-100)] to-[var(--sage-300)]",
          },
          {
            icon: <BriefcaseMedical className="w-8 h-8 text-[var(--sand-600)]" />,
            label: "Especialidades",
            value: totalEspecialidades,
            color: "from-[#f7e6d8] to-[#edd5c0]",
          },
          {
            icon: <Calendar className="w-8 h-8 text-[var(--sand-600)]" />,
            label: "Agendamentos",
            value: totalAgendamentos,
            color: "from-[#fbeee8] to-[#f1ded0]",
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`rounded-xl p-5 flex items-center gap-4 shadow-sm border border-white/40 bg-gradient-to-br ${card.color}`}
          >
            {card.icon}
            <div>
              <p className="text-[var(--text-muted)] text-sm">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Distribuição de Agendamentos */}
        <motion.div
          className="bg-white/90 p-6 rounded-xl shadow-md border border-white/40 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            Agendamentos por Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={agendamentosPorStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name} (${entry.value})`}
              >
                {agendamentosPorStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Especialidades com mais profissionais */}
        <motion.div
          className="bg-white/90 p-6 rounded-xl shadow-md border border-white/40 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            Profissionais por Especialidade
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={especialidadesMaisUsadas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#caa57a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Lista resumida de profissionais */}
      <div className="bg-white/90 p-6 rounded-xl shadow-md border border-white/40 mt-8 backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4">
          Últimos profissionais cadastrados
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profissionais.slice(-6).map((prof) => (
            <div
              key={prof.id}
              className="border border-[var(--sand-200)] rounded-lg p-4 hover:shadow-md transition bg-white"
            >
              <p className="font-medium">
                {prof.usuario.nome}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {especialidades.find((e) => e.id === prof.especialidadeId)?.nome ||
                  "Sem especialidade"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
