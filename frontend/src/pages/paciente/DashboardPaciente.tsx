import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getUserFromToken } from '../../utils/getUserFromToken';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
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
    const [, setProfissionalSelecionado] = useState<Profissional | null>(null);
  const [especialidadeId, setEspecialidadeId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = getUserFromToken();

  // =============================
  // Carregar dados iniciais
  // =============================
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

  // =============================
  // Carregar profissionais
  // =============================
  useEffect(() => {
    if (especialidadeId) {
      api
        .get(`/profissionais?especialidade=${especialidadeId}`)
        .then((res) => setProfissionais(res.data))
        .catch((err) => console.error('Erro ao carregar profissionais:', err));
    } else {
      setProfissionais([]);
      setProfissionalSelecionado(null);
    }
  }, [especialidadeId]);

  // =============================
  // Selecionar profissional
  // =============================
  const handleSelecionarProfissional = (id: string) => {
    setProfissionalId(id);
    const profissional = profissionais.find((p) => p.id === Number(id)) ?? null;
    setProfissionalSelecionado(profissional);
    setHorariosDisponiveis([]);
    setHora('');
  };

  // =============================
  // Buscar horários disponíveis
  // =============================
  useEffect(() => {
    if (profissionalId && data) {
      setCarregandoHorarios(true);
      api
        .get(`/profissionais/${profissionalId}/disponibilidade?data=${data}`)
        .then((res) => setHorariosDisponiveis(res.data))
        .catch((err) => {
          console.error('Erro ao buscar disponibilidade:', err);
          setHorariosDisponiveis([]);
        })
        .finally(() => setCarregandoHorarios(false));
    }
  }, [profissionalId, data]);

  // =============================
  // Criar novo agendamento
  // =============================
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
      setProfissionalId('');
      setEspecialidadeId('');
      setData('');
      setHora('');
      setHorariosDisponiveis([]);
      const agRes = await api.get('/agendamentos/me');
      setAgendamentos(agRes.data);
    } catch (error) {
      const err = error as AxiosError<{ erro: string }>;
      const msg = err.response?.data?.erro ?? 'Erro ao criar agendamento.';
      toast.error(msg);
    }
  };

  // =============================
  // Cancelar agendamento
  // =============================
  const handleCancelar = async (id: number) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      await api.patch(`/agendamentos/${id}/status`, { status: 'CANCELADO' });
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELADO' } : a))
      );
      toast.success('Agendamento cancelado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cancelar agendamento.');
    }
  };

  const dataMinima = new Date().toISOString().split('T')[0];

  if (loading) {
    return <p className="text-gray-600 p-6">Carregando...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Meu Painel</h1>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-600 text-white rounded-lg p-4">
          <h2 className="text-sm opacity-80">Total de Agendamentos</h2>
          <p className="text-lg font-semibold mt-1">{agendamentos.length}</p>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-4">
          <h2 className="text-sm opacity-80">Confirmados</h2>
          <p className="text-lg font-semibold mt-1">
            {agendamentos.filter((a) => a.status === 'CONFIRMADO').length}
          </p>
        </div>
        <div className="bg-yellow-500 text-white rounded-lg p-4">
          <h2 className="text-sm opacity-80">Pendentes</h2>
          <p className="text-lg font-semibold mt-1">
            {agendamentos.filter((a) => a.status === 'AGENDADO').length}
          </p>
        </div>
      </div>

      {/* Lista de agendamentos */}
      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <h2 className="text-lg font-semibold mb-4">Meus Agendamentos</h2>

        {agendamentos.length === 0 ? (
          <p className="text-gray-600">Você ainda não possui agendamentos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left">Data</th>
                  <th className="p-2 text-left">Profissional</th>
                  <th className="p-2 text-left">Especialidade</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">
                      {new Date(a.data).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-2">{a.profissional.usuario.nome}</td>
                    <td className="p-2">{a.profissional.especialidade?.nome}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.status === 'CONFIRMADO'
                            ? 'bg-green-100 text-green-700'
                            : a.status === 'CANCELADO'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {a.status !== 'CANCELADO' && (
                        <button
                          onClick={() => handleCancelar(a.id)}
                          className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Criar novo agendamento */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Novo Agendamento</h2>
        <form
          onSubmit={handleAgendar}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <select
            value={especialidadeId}
            onChange={(e) => setEspecialidadeId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
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
            onChange={(e) => handleSelecionarProfissional(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
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
            className="border border-gray-300 rounded-lg px-3 py-2"
            required
          />

          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
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
      </div>
    </div>
  );
}
