import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Info, Edit, Trash2 } from "lucide-react";
import api from "../../../services/api";
import { toast } from "react-toastify";

// =====================
// Tipagens
// =====================
interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: "PACIENTE" | "PROFISSIONAL" | "RECEPCIONISTA";
}

interface Especialidade {
  id: number;
  nome: string;
}

export default function UsuarioManager() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "PACIENTE",
    especialidadeId: "",
  });
  const [detalhes, setDetalhes] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // =====================
  // Carregar usuários e especialidades
  // =====================
  const carregarUsuarios = async () => {
    try {
      const res = await api.get("/recepcionista/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar usuários");
    }
  };

  const carregarEspecialidades = async () => {
    try {
      const res = await api.get("/especialidades");
      setEspecialidades(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarEspecialidades();
  }, []);

  // =====================
  // Funções de CRUD
  // =====================
  const handleCadastrar = async () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      await api.post("/recepcionista/usuarios", novoUsuario);
      toast.success("Usuário cadastrado com sucesso!");
      setNovoUsuario({ nome: "", email: "", senha: "", tipo: "PACIENTE", especialidadeId: "" });
      carregarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await api.delete(`/recepcionista/usuarios/${id}`);
      toast.success("Usuário excluído!");
      carregarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir usuário.");
    }
  };

  // =====================
  // Renderização
  // =====================
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciamento de Usuários</h1>

      {/* Formulário de cadastro */}
      <motion.div
        className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-500" /> Cadastrar novo usuário
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={novoUsuario.nome}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
            className="border rounded-lg p-2 w-full"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={novoUsuario.email}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
            className="border rounded-lg p-2 w-full"
          />
          <input
            type="password"
            placeholder="Senha"
            value={novoUsuario.senha}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
            className="border rounded-lg p-2 w-full"
          />
          <select
            value={novoUsuario.tipo}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, tipo: e.target.value })}
            className="border rounded-lg p-2 w-full"
          >
            <option value="PACIENTE">Paciente</option>
            <option value="PROFISSIONAL">Profissional</option>
          </select>

          {/* Campo extra se for profissional */}
          {novoUsuario.tipo === "PROFISSIONAL" && (
            <select
              value={novoUsuario.especialidadeId}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, especialidadeId: e.target.value })}
              className="border rounded-lg p-2 w-full"
            >
              <option value="">Selecione a especialidade</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nome}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={handleCadastrar}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </motion.div>

      {/* Lista de usuários */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {usuarios.map((user) => (
          <motion.div
            key={user.id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg border border-gray-100 transition"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">{user.nome}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="mt-2 text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 inline-block rounded">
              {user.tipo}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setDetalhes(user)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Info size={16} /> Informações
              </button>
              <button
                onClick={() => toast.info("Função de edição em desenvolvimento")}
                className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800"
              >
                <Edit size={16} /> Editar
              </button>
              <button
                onClick={() => handleExcluir(user.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de informações */}
      {detalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">{detalhes.nome}</h3>
            <p><strong>Email:</strong> {detalhes.email}</p>
            <p><strong>Tipo:</strong> {detalhes.tipo}</p>
            <button
              onClick={() => setDetalhes(null)}
              className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
