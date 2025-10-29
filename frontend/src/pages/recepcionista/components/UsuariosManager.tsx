// src/pages/recepcionista/components/UsuariosManager.tsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";

interface Especialidade {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: "PACIENTE" | "PROFISSIONAL" | "RECEPCIONISTA";
  criadoEm: string;
  profissional?: {
    especialidade?: { nome: string };
  };
}

export default function UsuariosManager() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "PACIENTE",
    especialidadeId: "",
    horaInicio: "",
    horaFim: "",
    formacao: "",
    biografia: "",
  });

  async function carregarUsuarios() {
    try {
      const res = await api.get("/recepcionista/usuarios");
      setUsuarios(res.data);
    } catch {
      toast.error("Erro ao carregar usuários");
    }
  }

  async function carregarEspecialidades() {
    try {
      const res = await api.get("/recepcionista/especialidades");
      setEspecialidades(res.data);
    } catch {
      toast.error("Erro ao carregar especialidades");
    }
  }

  useEffect(() => {
    carregarUsuarios();
    carregarEspecialidades();
  }, []);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/recepcionista/usuarios", novoUsuario);
      toast.success("Usuário cadastrado com sucesso!");
      setNovoUsuario({
        nome: "",
        email: "",
        senha: "",
        tipo: "PACIENTE",
        especialidadeId: "",
        horaInicio: "",
        horaFim: "",
        formacao: "",
        biografia: "",
      });
      await carregarUsuarios();
    } catch {
      toast.error("Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await api.delete(`/recepcionista/usuarios/${id}`);
      toast.success("Usuário excluído com sucesso");
      await carregarUsuarios();
    } catch {
      toast.error("Erro ao excluir usuário");
    }
  }

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Formulário de Cadastro */}
      <form
        onSubmit={handleCadastrar}
        className="bg-white shadow rounded-xl p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold">Cadastrar Usuário</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nome completo"
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
              setNovoUsuario({ ...novoUsuario, tipo: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="PACIENTE">Paciente</option>
            <option value="PROFISSIONAL">Profissional</option>
            <option value="RECEPCIONISTA">Recepcionista</option>
          </select>

          {/* Campos extras só se for PROFISSIONAL */}
          {novoUsuario.tipo === "PROFISSIONAL" && (
            <>
              <select
                value={novoUsuario.especialidadeId}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    especialidadeId: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Selecione a especialidade</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nome}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Formação (ex: Medicina - USP)"
                value={novoUsuario.formacao}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, formacao: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Biografia"
                value={novoUsuario.biografia}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, biografia: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2"
              />
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      {/* Lista de Usuários */}
      <div className="bg-white shadow rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Usuários Cadastrados</h2>
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">E-mail</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Especialidade</th>
                <th className="p-2 text-left">Criado em</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{u.nome}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.tipo}</td>
                  <td className="p-2">
                    {u.profissional?.especialidade?.nome ?? "-"}
                  </td>
                  <td className="p-2">
                    {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleExcluir(u.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 italic"
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
