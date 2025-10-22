import React, { useEffect, useState, type JSX } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Especialidade {
  id: number;
  nome: string;
}

interface Profissional {
  id: number;
  especialidade?: Especialidade;
  diasAtendimento?: string[];
  horaInicio?: string;
  horaFim?: string;
  formacao?: string;
  biografia?: string;
  fotoPerfil?: string | null;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: "PACIENTE" | "PROFISSIONAL" | "RECEPCIONISTA";
  profissional?: Profissional | null;
}

interface Agendamento {
  id: number;
  data: string;
  hora: string;
  status: string;
  paciente: { nome: string } | null;
  profissional: {
    usuario: { nome: string } | null;
    especialidade: { nome: string } | null;
  } | null;
}

type NovoUsuarioState = {
  nome: string;
  email: string;
  senha: string;
  tipo: "PACIENTE" | "PROFISSIONAL" | "RECEPCIONISTA";
  especialidadeId: string;
  diasAtendimento: string[];
  horaInicio: string;
  horaFim: string;
  formacao: string;
  biografia: string;
  fotoPerfil: string;
};

export default function DashboardRecepcionista(): JSX.Element {
  const [tab, setTab] = useState<"agendamentos" | "usuarios" | "especialidades">(
    "agendamentos"
  );

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novaEspecialidade, setNovaEspecialidade] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [novoUsuario, setNovoUsuario] = useState<NovoUsuarioState>({
    nome: "",
    email: "",
    senha: "",
    tipo: "PROFISSIONAL",
    especialidadeId: "",
    diasAtendimento: [],
    horaInicio: "",
    horaFim: "",
    formacao: "",
    biografia: "",
    fotoPerfil: "",
  });

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [mostrarInfoModal, setMostrarInfoModal] = useState<boolean>(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState<boolean>(false);

  // =====================
  // Carregamento inicial
  // =====================
  async function carregarUsuarios(): Promise<void> {
    try {
      const res = await api.get<Usuario[]>("/recepcionista/usuarios");
      setUsuarios(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários.");
    }
  }

  async function carregarAgendamentos(): Promise<void> {
    try {
      const res = await api.get<Agendamento[]>("/recepcionista/agendamentos");
      setAgendamentos(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos.");
    }
  }

  async function carregarEspecialidades(): Promise<void> {
    try {
      const res = await api.get<Especialidade[]>("/recepcionista/especialidades");
      setEspecialidades(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar especialidades:", error);
      toast.error("Erro ao carregar especialidades.");
    }
  }

  useEffect(() => {
    carregarUsuarios();
    carregarAgendamentos();
    carregarEspecialidades();
  }, []);

  // =====================
  // Ações: Usuários
  // =====================
  async function handleCadastrarUsuario(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      // montar payload conforme seu backend espera
      const payload = {
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        senha: novoUsuario.senha,
        tipo: novoUsuario.tipo,
        especialidadeId: novoUsuario.especialidadeId || undefined,
        diasAtendimento: novoUsuario.diasAtendimento,
        horaInicio: novoUsuario.horaInicio,
        horaFim: novoUsuario.horaFim,
        formacao: novoUsuario.formacao,
        biografia: novoUsuario.biografia,
        fotoPerfil: novoUsuario.fotoPerfil || null,
      };

      await api.post("/recepcionista/usuarios", payload);
      toast.success("Usuário cadastrado com sucesso!");
      // reset form
      setNovoUsuario({
        nome: "",
        email: "",
        senha: "",
        tipo: "PROFISSIONAL",
        especialidadeId: "",
        diasAtendimento: [],
        horaInicio: "",
        horaFim: "",
        formacao: "",
        biografia: "",
        fotoPerfil: "",
      });
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      toast.error("Erro ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluirUsuario(id: number): Promise<void> {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await api.delete(`/recepcionista/usuarios/${id}`);
      toast.success("Usuário excluído com sucesso!");
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário.");
    }
  }

  function handleVerInformacoes(usuario: Usuario): void {
    setUsuarioSelecionado(usuario);
    setMostrarInfoModal(true);
  }

  function handleEditarUsuario(usuario: Usuario): void {
    setUsuarioSelecionado(usuario);
    setMostrarEditarModal(true);
  }

  async function handleSalvarEdicao(usuarioEditado: Usuario | null): Promise<void> {
    if (!usuarioEditado) return;
    try {
      const payload = {
        nome: usuarioEditado.nome,
        email: usuarioEditado.email,
      };
      await api.put(`/recepcionista/usuarios/${usuarioEditado.id}`, payload);
      toast.success("Usuário atualizado com sucesso!");
      setMostrarEditarModal(false);
      setUsuarioSelecionado(null);
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário.");
    }
  }

  // =====================
  // Ações: Agendamentos
  // =====================
  async function handleAtualizarStatus(id: number, novoStatus: string): Promise<void> {
    try {
      await api.put(`/recepcionista/agendamentos/${id}`, { status: novoStatus });
      toast.success("Status atualizado!");
      await carregarAgendamentos();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status.");
    }
  }

  // =====================
  // Ações: Especialidades
  // =====================
  async function handleCriarEspecialidade(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    try {
      if (!novaEspecialidade.trim()) {
        toast.warn("Digite o nome da especialidade.");
        return;
      }
      await api.post("/recepcionista/especialidades", { nome: novaEspecialidade.trim() });
      toast.success("Especialidade criada!");
      setNovaEspecialidade("");
      await carregarEspecialidades();
    } catch (error) {
      console.error("Erro ao criar especialidade:", error);
      toast.error("Erro ao criar especialidade.");
    }
  }

  async function handleExcluirEspecialidade(id: number): Promise<void> {
    if (!confirm("Remover esta especialidade?")) return;
    try {
      await api.delete(`/recepcionista/especialidades/${id}`);
      toast.success("Especialidade removida!");
      await carregarEspecialidades();
    } catch (error) {
      console.error("Erro ao excluir especialidade:", error);
      toast.error("Erro ao excluir especialidade.");
    }
  }

  // =====================
  // Helpers para formulário novoUsuario
  // =====================
  function toggleDiaAtendimento(dia: string): void {
    setNovoUsuario((prev) => {
      const exists = prev.diasAtendimento.includes(dia);
      return {
        ...prev,
        diasAtendimento: exists
          ? prev.diasAtendimento.filter((d) => d !== dia)
          : [...prev.diasAtendimento, dia],
      };
    });
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel do Recepcionista</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("agendamentos")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "agendamentos" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Agendamentos
        </button>
        <button
          onClick={() => setTab("usuarios")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "usuarios" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setTab("especialidades")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "especialidades" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Especialidades
        </button>
      </div>

      {/* AGENDAMENTOS */}
      {tab === "agendamentos" && (
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Agendamentos da Clínica</h2>

          {agendamentos.length === 0 ? (
            <p className="text-gray-600">Nenhum agendamento encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Hora</th>
                    <th className="p-2 text-left">Paciente</th>
                    <th className="p-2 text-left">Profissional</th>
                    <th className="p-2 text-left">Especialidade</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-2">{a.data ? new Date(a.data).toLocaleDateString("pt-BR") : "-"}</td>
                      <td className="p-2">{a.hora || "-"}</td>
                      <td className="p-2">{a.paciente?.nome || "-"}</td>
                      <td className="p-2">{a.profissional?.usuario?.nome || "-"}</td>
                      <td className="p-2">{a.profissional?.especialidade?.nome || "-"}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            a.status === "CONFIRMADO"
                              ? "bg-green-100 text-green-700"
                              : a.status === "CANCELADO"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleAtualizarStatus(a.id, "CONFIRMADO")}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleAtualizarStatus(a.id, "CANCELADO")}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USUÁRIOS */}
      {tab === "usuarios" && (
        <div className="space-y-6">
          {/* Formulário de cadastro */}
          <form onSubmit={handleCadastrarUsuario} className="bg-white shadow rounded-xl p-5 space-y-6">
            <h2 className="text-lg font-semibold mb-4">Cadastrar novo usuário</h2>

            {/* Tipo de usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de usuário</label>
              <select
                value={novoUsuario.tipo}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    tipo: e.target.value as "PACIENTE" | "PROFISSIONAL",
                  })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="PACIENTE">Paciente</option>
                <option value="PROFISSIONAL">Profissional</option>
              </select>
            </div>

            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />

              <input
                type="email"
                placeholder="E-mail"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />

              <input
                type="password"
                placeholder="Senha"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Campos extras – aparecem só para PROFISSIONAL */}
            {novoUsuario.tipo === "PROFISSIONAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Especialidade */}
                <select
                  value={novoUsuario.especialidadeId}
                  onChange={(e) =>
                    setNovoUsuario({ ...novoUsuario, especialidadeId: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Selecione a especialidade</option>
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={String(esp.id)}>
                      {esp.nome}
                    </option>
                  ))}
                </select>

                {/* Dias de atendimento */}
                <div className="flex flex-col border border-gray-300 rounded-lg p-3">
                  <label className="text-sm font-medium mb-2">Dias de atendimento</label>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"].map((dia) => (
                      <label key={dia} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={novoUsuario.diasAtendimento.includes(dia)}
                          onChange={() => toggleDiaAtendimento(dia)}
                        />
                        {dia.charAt(0) + dia.slice(1).toLowerCase()}
                      </label>
                    ))}
                  </div>
                </div>

                <input
                  type="time"
                  value={novoUsuario.horaInicio}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, horaInicio: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />

                <input
                  type="time"
                  value={novoUsuario.horaFim}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, horaFim: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />

                <input
                  type="text"
                  placeholder="Formação (ex: Medicina - UFRGS)"
                  value={novoUsuario.formacao}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, formacao: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />

                <textarea
                  placeholder="Biografia profissional"
                  value={novoUsuario.biografia}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, biografia: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2"
                  rows={3}
                />

                <input
                  type="text"
                  placeholder="URL da foto de perfil (opcional)"
                  value={novoUsuario.fotoPerfil}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, fotoPerfil: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
              {loading && <p className="text-sm text-gray-600">Processando...</p>}
            </div>
          </form>


          {/* Lista de usuários */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">Todos os usuários cadastrados</h2>

            {usuarios.length === 0 ? (
              <p className="text-gray-600">Nenhum usuário encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">E-mail</th>
                      <th className="p-2 text-left">Tipo</th>
                      <th className="p-2 text-left">Especialidade</th>
                      <th className="p-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-2">{u.id}</td>
                        <td className="p-2">{u.nome}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.tipo}</td>
                        <td className="p-2">{u.profissional?.especialidade?.nome || "-"}</td>
                        <td className="p-2 flex gap-2">
                          <button
                            onClick={() => handleVerInformacoes(u)}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                          >
                            Informações
                          </button>
                          <button
                            onClick={() => handleEditarUsuario(u)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluirUsuario(u.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal de Informações */}
          {mostrarInfoModal && usuarioSelecionado && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
                <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>

                <div className="space-y-2">
                  <p><strong>ID:</strong> {usuarioSelecionado.id}</p>
                  <p><strong>Nome:</strong> {usuarioSelecionado.nome}</p>
                  <p><strong>Email:</strong> {usuarioSelecionado.email}</p>
                  <p><strong>Tipo:</strong> {usuarioSelecionado.tipo}</p>
                  {usuarioSelecionado.profissional && (
                    <>
                      <p><strong>Formação:</strong> {usuarioSelecionado.profissional.formacao || "-"}</p>
                      <p><strong>Biografia:</strong> {usuarioSelecionado.profissional.biografia || "-"}</p>
                      <p><strong>Especialidade:</strong> {usuarioSelecionado.profissional.especialidade?.nome || "-"}</p>
                      <p><strong>Dias atendimento:</strong> {usuarioSelecionado.profissional.diasAtendimento?.join(", ") || "-"}</p>
                      <p><strong>Horário:</strong> {usuarioSelecionado.profissional.horaInicio || "-"} - {usuarioSelecionado.profissional.horaFim || "-"}</p>
                    </>
                  )}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setMostrarInfoModal(false);
                      setUsuarioSelecionado(null);
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Edição */}
          {mostrarEditarModal && usuarioSelecionado && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                <h2 className="text-lg font-semibold mb-4">Editar Usuário</h2>

                <input
                  type="text"
                  placeholder="Nome"
                  value={usuarioSelecionado.nome}
                  onChange={(e) => setUsuarioSelecionado({ ...usuarioSelecionado, nome: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3"
                />

                <input
                  type="email"
                  placeholder="E-mail"
                  value={usuarioSelecionado.email}
                  onChange={(e) => setUsuarioSelecionado({ ...usuarioSelecionado, email: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleSalvarEdicao(usuarioSelecionado)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setMostrarEditarModal(false);
                      setUsuarioSelecionado(null);
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ESPECIALIDADES */}
      {tab === "especialidades" && (
        <div className="bg-white shadow rounded-xl p-5 space-y-6">
          <h2 className="text-lg font-semibold mb-4">Gerenciar Especialidades</h2>

          <form onSubmit={handleCriarEspecialidade} className="flex gap-2">
            <input
              type="text"
              placeholder="Nome da especialidade"
              value={novaEspecialidade}
              onChange={(e) => setNovaEspecialidade(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Adicionar
            </button>
          </form>

          {especialidades.length === 0 ? (
            <p className="text-gray-600">Nenhuma especialidade cadastrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Nome</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {especialidades.map((esp) => (
                    <tr key={esp.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-2">{esp.id}</td>
                      <td className="p-2">{esp.nome}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleExcluirEspecialidade(esp.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
