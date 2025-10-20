import { useEffect, useState } from "react";
import  api  from "../../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: "PACIENTE" | "PROFISSIONAL" | "RECEPCIONISTA";
}

interface Agendamento {
  id: number;
  data: string;
  hora: string;
  status: string;
  paciente: { nome: string };
  profissional: { usuario: { nome: string } };
}

export default function DashboardRecepcionista() {
  const [tab, setTab] = useState<"agendamentos" | "usuarios">("agendamentos");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "PACIENTE",
  });
  const [loading, setLoading] = useState(false);

  // =====================
  // 📋 LISTAGENS
  // =====================
  async function carregarUsuarios() {
    try {
      const res = await api.get("/recepcionista/usuarios");
      setUsuarios(res.data);
    } catch {
      toast.error("Erro ao carregar usuários.");
    }
  }

  async function carregarAgendamentos() {
    try {
      const res = await api.get("/recepcionista/agendamentos");
      setAgendamentos(res.data);
    } catch {
      toast.error("Erro ao carregar agendamentos.");
    }
  }

  useEffect(() => {
    carregarUsuarios();
    carregarAgendamentos();
  }, []);

  // =====================
  // ➕ CADASTRO DE USUÁRIO
  // =====================
  async function handleCadastrarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/recepcionista/usuarios", novoUsuario);
      toast.success("Usuário cadastrado com sucesso!");
      setNovoUsuario({ nome: "", email: "", senha: "", tipo: "PACIENTE" });
      carregarUsuarios();
    } catch {
      toast.error("Erro ao cadastrar usuário. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // 🗑️ EXCLUSÃO DE USUÁRIO
  // =====================
  async function handleExcluirUsuario(id: number) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await api.delete(`/recepcionista/usuarios/${id}`);
      toast.success("Usuário excluído com sucesso!");
      carregarUsuarios();
    } catch {
      toast.error("Erro ao excluir usuário.");
    }
  }

  // =====================
  // 🔄 ATUALIZAR STATUS DE AGENDAMENTO
  // =====================
  async function handleAtualizarStatus(id: number, novoStatus: string) {
    try {
      await api.put(`/recepcionista/agendamentos/${id}`, { status: novoStatus });
      toast.success("Status atualizado!");
      carregarAgendamentos();
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Painel do Recepcionista
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("agendamentos")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "agendamentos"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Agendamentos
        </button>
        <button
          onClick={() => setTab("usuarios")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "usuarios"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Usuários
        </button>
      </div>

      {/* ===================== */}
      {/* 🗓️ ABA: AGENDAMENTOS */}
      {/* ===================== */}
      {tab === "agendamentos" && (
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            Agendamentos da Clínica
          </h2>
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
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-2">{a.data}</td>
                      <td className="p-2">{a.hora}</td>
                      <td className="p-2">{a.paciente?.nome}</td>
                      <td className="p-2">{a.profissional?.usuario?.nome}</td>
                      <td className="p-2">{a.status}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() =>
                            handleAtualizarStatus(a.id, "CONFIRMADO")
                          }
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() =>
                            handleAtualizarStatus(a.id, "CANCELADO")
                          }
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

      {/* ===================== */}
      {/* 👥 ABA: USUÁRIOS */}
      {/* ===================== */}
      {tab === "usuarios" && (
        <div className="space-y-6">
          {/* Cadastro */}
          <form
            onSubmit={handleCadastrarUsuario}
            className="bg-white shadow rounded-xl p-5"
          >
            <h2 className="text-lg font-semibold mb-4">
              Cadastrar novo usuário
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={novoUsuario.nome}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, nome: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="E-mail"
                value={novoUsuario.email}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, email: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={novoUsuario.senha}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, senha: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <select
                value={novoUsuario.tipo}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    tipo: e.target.value as Usuario["tipo"],
                  })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="PACIENTE">Paciente</option>
                <option value="PROFISSIONAL">Profissional</option>
                <option value="RECEPCIONISTA">Recepcionista</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          {/* Lista */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Todos os usuários cadastrados
            </h2>
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
                      <th className="p-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-2">{u.id}</td>
                        <td className="p-2">{u.nome}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.tipo}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleExcluirUsuario(u.id)}
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
        </div>
      )}
    </div>
  );
}
