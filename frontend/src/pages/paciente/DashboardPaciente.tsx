import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getUserFromToken } from '../../utils/getUserFromToken';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  User,
  XCircle,
  HeartPulse,
  ClipboardList,
  Stethoscope,
  Mail,
} from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

interface Especialidade {
  id: number;
  nome: string;
}

interface Profissional {
  id: number;
  usuarioId: number;
  especialidadeId: number;
  diasAtendimento: string[];
  horaInicio: string;
  horaFim: string;
  biografia?: string | null;
  formacao?: string | null;
  fotoPerfil?: string | null;
  usuario: {
    nome: string;
    email: string;
  };
  especialidade?: {
    nome: string;
  };
}

interface Agendamento {
  id: number;
  data: string;
  status: string;
  profissional: Profissional;
}

export default function DashboardPaciente() {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [profissionalId, setProfissionalId] = useState('');
  const [especialidadeId, setEspecialidadeId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = getUserFromToken();
  const dataMinima = new Date().toISOString().split('T')[0];

  // ============= CARREGAR DADOS INICIAIS =============
  useEffect(() => {
    async function fetchData() {
      try {
        const [espRes, agRes] = await Promise.all([
          api.get('/especialidades'),
          api.get('/agendamentos/me'),
        ]);
        setEspecialidades(espRes.data);
        setAgendamentos(agRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ============= CARREGAR PROFISSIONAIS =============
  useEffect(() => {
    if (especialidadeId) {
      api
        .get(`/profissionais?especialidade=${especialidadeId}`)
        .then((res) => setProfissionais(res.data))
        .catch(() => setProfissionais([]));
    } else {
      setProfissionais([]);
    }
  }, [especialidadeId]);

  // ============= DISPONIBILIDADE =============
  useEffect(() => {
    if (profissionalId && data) {
      setCarregandoHorarios(true);
      api
        .get(`/profissionais/${profissionalId}/disponibilidade?data=${data}`)
        .then((res) => setHorariosDisponiveis(res.data))
        .catch(() => setHorariosDisponiveis([]))
        .finally(() => setCarregandoHorarios(false));
    }
  }, [profissionalId, data]);

  // ============= CRIAR AGENDAMENTO =============
  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profissionalId || !data || !hora) {
      toast.warn('Preencha todos os campos para agendar.');
      return;
    }

    const dataHoraSelecionada = new Date(`${data}T${hora}:00`);
    if (dataHoraSelecionada < new Date()) {
      toast.error('Não é permitido agendar em datas passadas.');
      return;
    }

    try {
      await api.post('/agendamentos', {
        pacienteId: user?.id,
        profissionalId: Number(profissionalId),
        data: dataHoraSelecionada.toISOString(),
      });
      toast.success('Agendamento criado com sucesso!');
      const agRes = await api.get('/agendamentos/me');
      setAgendamentos(agRes.data);
      setEspecialidadeId('');
      setProfissionalId('');
      setData('');
      setHora('');
      setHorariosDisponiveis([]);
    } catch (error) {
      const err = error as AxiosError<{ erro: string }>;
      toast.error(err.response?.data?.erro ?? 'Erro ao criar agendamento.');
    }
  };

  // ============= CANCELAR =============
  const handleCancelar = async (id: number) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      await api.patch(`/agendamentos/${id}/status`, { status: 'CANCELADO' });
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELADO' } : a))
      );
      toast.success('Agendamento cancelado!');
    } catch {
      toast.error('Erro ao cancelar agendamento.');
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Carregando...</p>;

  const proximoAgendamento = agendamentos
    .filter((a) => new Date(a.data) > new Date() && a.status !== 'CANCELADO')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];

  const total = agendamentos.length;
  const confirmados = agendamentos.filter((a) => a.status === 'CONFIRMADO').length;
  const cancelados = agendamentos.filter((a) => a.status === 'CANCELADO').length;
  const futuros = agendamentos.filter(
    (a) => new Date(a.data) > new Date() && a.status !== 'CANCELADO'
  ).length;

  // =====================================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-10">
      {/* CABEÇALHO */}
      <header className="flex flex-col items-center text-center space-y-2">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Olá, {user?.nome || user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          Aqui você pode acompanhar suas consultas e agendar novas.
        </p>
      </header>

      {/* RESUMO */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow-sm rounded-xl p-4 text-center border border-gray-100">
          <HeartPulse className="w-6 h-6 mx-auto text-blue-500 mb-2" />
          <h3 className="text-gray-500 text-sm">Total de Consultas</h3>
          <p className="text-lg font-bold text-gray-800">{total}</p>
        </div>
        <div className="bg-white shadow-sm rounded-xl p-4 text-center border border-gray-100">
          <Calendar className="w-6 h-6 mx-auto text-green-500 mb-2" />
          <h3 className="text-gray-500 text-sm">Próximas</h3>
          <p className="text-lg font-bold text-gray-800">{futuros}</p>
        </div>
        <div className="bg-white shadow-sm rounded-xl p-4 text-center border border-gray-100">
          <ClipboardList className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <h3 className="text-gray-500 text-sm">Confirmadas</h3>
          <p className="text-lg font-bold text-gray-800">{confirmados}</p>
        </div>
        <div className="bg-white shadow-sm rounded-xl p-4 text-center border border-gray-100">
          <XCircle className="w-6 h-6 mx-auto text-red-500 mb-2" />
          <h3 className="text-gray-500 text-sm">Canceladas</h3>
          <p className="text-lg font-bold text-gray-800">{cancelados}</p>
        </div>
      </section>

      {/* PRÓXIMA CONSULTA */}
      {proximoAgendamento && (
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Sua próxima consulta
          </h2>
          <div className="flex items-center gap-3">
            <img
              src={proximoAgendamento.profissional.fotoPerfil || '/default-doctor.png'}
              alt="Médico"
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div>
              <p className="font-medium text-gray-800">
                {proximoAgendamento.profissional.usuario.nome}
              </p>
              <p className="text-sm text-gray-500">
                {proximoAgendamento.profissional.especialidade?.nome}
              </p>
              <p className="flex items-center text-sm text-gray-600 gap-1 mt-1">
                <Clock className="w-4 h-4" />{' '}
                {new Date(proximoAgendamento.data).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* LISTA DE AGENDAMENTOS */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" /> Meus Agendamentos
        </h2>

        {agendamentos.length === 0 ? (
          <div className="text-gray-500 text-center py-10 bg-white rounded-xl shadow-sm">
            <Stethoscope className="mx-auto w-10 h-10 text-gray-300 mb-3" />
            <p>Você ainda não possui consultas marcadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agendamentos.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={a.profissional.fotoPerfil || '/default-doctor.png'}
                    alt="Médico"
                    className="w-14 h-14 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {a.profissional.usuario.nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.profissional.especialidade?.nome}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(a.data).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {new Date(a.data).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Mail className="w-4 h-4" />
                  {a.profissional.usuario.email}
                </div>

                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${
                    a.status === 'CONFIRMADO'
                      ? 'bg-green-100 text-green-700'
                      : a.status === 'CANCELADO'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {a.status}
                </span>

                {a.status !== 'CANCELADO' && (
                  <button
                    onClick={() => handleCancelar(a.id)}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                  >
                    <XCircle className="w-4 h-4" /> Cancelar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NOVO AGENDAMENTO */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Agendar nova consulta
        </h2>

        <form
          onSubmit={handleAgendar}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <select
            value={especialidadeId}
            onChange={(e) => setEspecialidadeId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Especialidade</option>
            {especialidades.map((esp) => (
              <option key={esp.id} value={String(esp.id)}>
                {esp.nome}
              </option>
            ))}
          </select>

          <select
            value={profissionalId}
            onChange={(e) => setProfissionalId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Profissional</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.usuario.nome} — {p.especialidade?.nome}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            min={dataMinima}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />

          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            disabled={carregandoHorarios || !horariosDisponiveis.length}
            required
          >
            <option value="">
              {carregandoHorarios ? 'Carregando...' : 'Horário'}
            </option>
            {horariosDisponiveis.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition md:col-span-2 lg:col-span-1"
          >
            Agendar
          </button>
        </form>
      </section>
    </div>
  );
}
