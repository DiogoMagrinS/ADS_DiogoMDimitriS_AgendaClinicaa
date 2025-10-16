import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Agendamento {
  id: number;
  data: string;
  status: string;
  profissional: {
    usuario: {
      nome: string;
    };
    especialidade: {
      nome: string;
    };
  };
}

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  // Carregar agendamentos ao abrir a tela
  useEffect(() => {
    async function fetchAgendamentos() {
      try {
        const res = await api.get('/agendamentos/me');
        setAgendamentos(res.data);
      } catch (err) {
        setErro('Não foi possível carregar seus agendamentos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgendamentos();
  }, []);

  // -----------------------------
  // Funções de status
  // -----------------------------

  // Cancelar (status = CANCELADO)
  const handleExcluir = async (id: number) => {
    const confirmar = confirm('Tem certeza que deseja cancelar este agendamento?');
    if (!confirmar) return;

    try {
      await api.patch(`/agendamentos/${id}/status`, { status: 'CANCELADO' });
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'CANCELADO' } : a
        )
      );
      alert('Agendamento cancelado com sucesso.');
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      setErro('Erro ao cancelar. Tente novamente.');
    }
  };

  // Confirmar (status = CONFIRMADO)
  const handleConfirmar = async (id: number) => {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status: 'CONFIRMADO' });
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'CONFIRMADO' } : a
        )
      );
      
    } catch (err) {
      console.error('Erro ao confirmar agendamento:', err);
      setErro('Erro ao confirmar. Tente novamente.');
    }
  };

  // -----------------------------
  // Funções de edição
  // -----------------------------
  const iniciarEdicao = (agendamento: Agendamento) => {
    setEditandoId(agendamento.id);
    const dataObj = new Date(agendamento.data);
    setNovaData(dataObj.toISOString().split('T')[0]);
    setNovaHora(dataObj.toTimeString().slice(0, 5));
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNovaData('');
    setNovaHora('');
  };

  const salvarAlteracoes = async (id: number) => {
    if (!novaData || !novaHora) {
      alert('Preencha data e hora');
      return;
    }

    const novaDataHora = new Date(`${novaData}T${novaHora}:00`).toISOString();

    try {
      await api.put(`/agendamentos/${id}`, { data: novaDataHora });
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, data: novaDataHora } : a
        )
      );
      alert('Agendamento atualizado com sucesso!');
      cancelarEdicao();
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      alert('Erro ao atualizar agendamento.');
    }
  };

  // -----------------------------
  // Renderização
  // -----------------------------
  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-gray-500">Carregando agendamentos...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie suas consultas com rapidez.</p>
        </div>

        {erro && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {erro}
          </div>
        )}

        {agendamentos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <ul className="space-y-4">
          {agendamentos.map((agendamento) => {
            const dataObj = new Date(agendamento.data);
            const dataFormatada = dataObj.toLocaleDateString();
            const horaFormatada = dataObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <li key={agendamento.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-gray-900 font-medium">{agendamento.profissional.usuario.nome}</p>
                    <p className="text-sm text-gray-600">{agendamento.profissional.especialidade.nome}</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {agendamento.status}
                  </span>
                </div>

                {editandoId === agendamento.id ? (
                  <>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nova data</label>
                        <input
                          type="date"
                          value={novaData}
                          onChange={(e) => setNovaData(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Novo horário</label>
                        <input
                          type="time"
                          value={novaHora}
                          onChange={(e) => setNovaHora(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => salvarAlteracoes(agendamento.id)}
                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                      >
                        Salvar Alterações
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="text-sm text-gray-700 hover:text-gray-900"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
                      <div>
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="font-medium">{dataFormatada}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Horário</p>
                        <p className="font-medium">{horaFormatada}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {agendamento.status === 'AGENDADO' && (
                        <button
                          onClick={() => handleConfirmar(agendamento.id)}
                          className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
                        >
                          Confirmar
                        </button>
                      )}

                      {agendamento.status !== 'CANCELADO' && (
                        <button
                          onClick={() => handleExcluir(agendamento.id)}
                          className="text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg"
                        >
                          Cancelar
                        </button>
                      )}

                      {agendamento.status !== 'CANCELADO' && (
                        <button
                          onClick={() => iniciarEdicao(agendamento)}
                          className="text-sm text-gray-700 hover:text-gray-900"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </>
                )}
              </li>
            );
          })}
          </ul>
        )}
      </div>
    </div>
  );
}
