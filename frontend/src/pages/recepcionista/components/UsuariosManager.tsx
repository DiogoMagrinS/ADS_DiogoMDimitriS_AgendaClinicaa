// src/pages/recepcionista/components/UsuariosManager.tsx
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";

interface Especialidade {
  id: number;
  nome: string;
}

interface Profissional {
  id: number;
  usuarioId: number;
  especialidadeId?: number | null;
  especialidade?: Especialidade | null;
  diasAtendimento?: string[] | null;
  horaInicio?: string | null;
  horaFim?: string | null;
  formacao?: string | null;
  biografia?: string | null;
  fotoPerfil?: string | null;
}

type TipoUsuario = "PACIENTE" | "PROFISSIONAL" | "RECEPCIONISTA";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  profissional?: Profissional | null;
}

interface NovoUsuarioState {
  nome: string;
  email: string;
  senha: string;
  tipo: Exclude<TipoUsuario, "RECEPCIONISTA">;
  especialidadeId: string;
  diasAtendimento: string[];
  horaInicio: string;
  horaFim: string;
  formacao: string;
  biografia: string;
  fotoPerfil: string;
}

export default function UsuariosManager() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pesquisa, setPesquisa] = useState<string>("");

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

  // modal para editar foto
  const [modalFotoAberto, setModalFotoAberto] = useState<boolean>(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [novaFotoUrl, setNovaFotoUrl] = useState<string>("");

  useEffect(() => {
    carregarUsuarios();
    carregarEspecialidades();
  }, []);

  useEffect(() => {
    if (pesquisa.trim() === "") {
      setUsuariosFiltrados(usuarios);
    } else {
      const filtro = usuarios.filter((u) =>
        `${u.nome} ${u.email}`.toLowerCase().includes(pesquisa.toLowerCase())
      );
      setUsuariosFiltrados(filtro);
    }
  }, [pesquisa, usuarios]);

  async function carregarUsuarios(): Promise<void> {
    try {
      setLoading(true);
      const res = await api.get<Usuario[]>("/recepcionista/usuarios");
      setUsuarios(res.data || []);
      setUsuariosFiltrados(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
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

  function toggleDiaAtendimento(dia: string): void {
    setNovoUsuario((prev) => {
      const existe = prev.diasAtendimento.includes(dia);
      return {
        ...prev,
        diasAtendimento: existe
          ? prev.diasAtendimento.filter((d) => d !== dia)
          : [...prev.diasAtendimento, dia],
      };
    });
  }

  async function handleCadastrarUsuario(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        senha: novoUsuario.senha,
        tipo: novoUsuario.tipo,
      };

      if (novoUsuario.tipo === "PROFISSIONAL") {
        payload.especialidadeId = novoUsuario.especialidadeId || undefined;
        payload.diasAtendimento = novoUsuario.diasAtendimento;
        payload.horaInicio = novoUsuario.horaInicio;
        payload.horaFim = novoUsuario.horaFim;
        payload.formacao = novoUsuario.formacao || undefined;
        payload.biografia = novoUsuario.biografia || undefined;
        payload.fotoPerfil = novoUsuario.fotoPerfil || undefined;
      }

      await api.post("/recepcionista/usuarios", payload);
      toast.success("Usuário cadastrado com sucesso.");
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
      toast.success("Usuário excluído.");
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário.");
    }
  }

  // Abrir modal de foto
  function abrirModalFoto(u: Usuario): void {
    setUsuarioSelecionado(u);
    setNovaFotoUrl(u.profissional?.fotoPerfil ?? "");
    setModalFotoAberto(true);
  }

  function fecharModalFoto(): void {
    setModalFotoAberto(false);
    setUsuarioSelecionado(null);
    setNovaFotoUrl("");
  }

  async function salvarFoto(): Promise<void> {
    if (!usuarioSelecionado) {
      toast.error("Usuário inválido.");
      return;
    }

    const profissionalId = usuarioSelecionado.profissional?.id;
    if (!profissionalId) {
      toast.error("Usuário selecionado não é um profissional.");
      return;
    }

    try {
      await api.put(`/profissionais/${profissionalId}`, { fotoPerfil: novaFotoUrl || null });
      toast.success("Foto atualizada.");
      fecharModalFoto();
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
      toast.error("Erro ao atualizar foto.");
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Gerenciar Usuários</h2>

      {/* Formulário de cadastro */}
      <form onSubmit={handleCadastrarUsuario} className="bg-gray-50 border border-gray-100 p-6 rounded-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de usuário</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNovoUsuario({ ...novoUsuario, tipo: "PACIENTE" })}
              className={`px-3 py-2 rounded-lg ${novoUsuario.tipo === "PACIENTE" ? "bg-blue-600 text-white" : "bg-white border"}`}
            >
              Paciente
            </button>
            <button
              type="button"
              onClick={() => setNovoUsuario({ ...novoUsuario, tipo: "PROFISSIONAL" })}
              className={`px-3 py-2 rounded-lg ${novoUsuario.tipo === "PROFISSIONAL" ? "bg-blue-600 text-white" : "bg-white border"}`}
            >
              Profissional
            </button>
          </div>
        </div>

        {novoUsuario.tipo === "PROFISSIONAL" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
            <select
              value={novoUsuario.especialidadeId}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, especialidadeId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione a especialidade</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={String(esp.id)}>
                  {esp.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={novoUsuario.nome}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={novoUsuario.email}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={novoUsuario.senha}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>

        {novoUsuario.tipo === "PROFISSIONAL" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora início</label>
                <input
                  type="time"
                  value={novoUsuario.horaInicio}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, horaInicio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fim</label>
                <input
                  type="time"
                  value={novoUsuario.horaFim}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, horaFim: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dias de atendimento</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"].map((dia) => (
                  <label key={dia} className="flex items-center gap-2 text-sm">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formação</label>
                <input
                  type="text"
                  value={novoUsuario.formacao}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, formacao: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Medicina - UFRGS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
                <input
                  type="text"
                  value={novoUsuario.fotoPerfil}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, fotoPerfil: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
              <textarea
                value={novoUsuario.biografia}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, biografia: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px]"
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processando..." : "Cadastrar"}
          </button>
        </div>
      </form>

      {/* Campo de pesquisa */}
      <div>
        <input
          type="text"
          placeholder="Pesquisar por nome ou e-mail..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 mb-4"
        />
      </div>

      {/* Lista de usuários */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mt-6 mb-4">Usuários cadastrados</h3>

        {usuariosFiltrados.length === 0 ? (
          <p className="text-gray-600">Nenhum usuário encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuariosFiltrados.map((u) => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex gap-4 items-center">
                <img
                  src={u.profissional?.fotoPerfil && u.profissional.fotoPerfil.trim() !== "" ? u.profissional.fotoPerfil : `https://i.pravatar.cc/100?u=${u.id}`}
                  alt={u.nome}
                  className="w-16 h-16 object-cover rounded-full border"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{u.nome}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{u.tipo}</p>
                      {u.profissional?.especialidade?.nome && (
                        <p className="text-sm text-blue-600 mt-1">{u.profissional.especialidade.nome}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => abrirModalFoto(u)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Editar Foto
                      </button>

                      <button
                        onClick={() => handleExcluirUsuario(u.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar foto */}
      {modalFotoAberto && usuarioSelecionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Editar foto de {usuarioSelecionado.nome}</h4>

            <label className="block text-sm text-gray-700 mb-2">Nova URL da foto</label>
            <input
              type="text"
              value={novaFotoUrl}
              onChange={(e) => setNovaFotoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              placeholder="https://..."
            />

            <div className="flex items-center gap-4 mb-4">
              <img
                src={novaFotoUrl || (usuarioSelecionado.profissional?.fotoPerfil ?? `https://i.pravatar.cc/100?u=${usuarioSelecionado.id}`)}
                alt="preview"
                className="w-24 h-24 object-cover rounded-full border"
              />
              <div>
                <p className="text-sm text-gray-600">Pré-visualização</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={fecharModalFoto} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button onClick={salvarFoto} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
