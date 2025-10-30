import { useEffect, useState } from "react";
import type { FormEvent, JSX } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";

interface Especialidade {
  id: number;
  nome: string;
  profissionaisCount?: number;
}

export default function EspecialidadesManager(): JSX.Element {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novaEspecialidade, setNovaEspecialidade] = useState<string>("");
  const [editando, setEditando] = useState<Especialidade | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  // =============================
  // 🔹 Carregar especialidades
  // =============================
  const carregarEspecialidades = async (): Promise<void> => {
    try {
      setCarregando(true);
      const res = await api.get<Especialidade[]>("/recepcionista/especialidades");
      setEspecialidades(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar especialidades:", error);
      toast.error("Erro ao carregar especialidades.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarEspecialidades();
  }, []);

  // =============================
  // 🔹 Criar especialidade
  // =============================
  const handleCriar = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!novaEspecialidade.trim()) {
      toast.warn("Digite o nome da especialidade.");
      return;
    }

    try {
      await api.post("/recepcionista/especialidades", { nome: novaEspecialidade.trim() });
      toast.success("Especialidade criada com sucesso!");
      setNovaEspecialidade("");
      await carregarEspecialidades();
    } catch (error) {
      console.error("Erro ao criar especialidade:", error);
      toast.error("Erro ao criar especialidade.");
    }
  };

  // =============================
  // 🔹 Editar especialidade
  // =============================
  const handleSalvarEdicao = async (): Promise<void> => {
    if (!editando) return;

    try {
      await api.put(`/recepcionista/especialidades/${editando.id}`, {
        nome: editando.nome,
      });
      toast.success("Especialidade atualizada!");
      setEditando(null);
      await carregarEspecialidades();
    } catch (error) {
      console.error("Erro ao editar especialidade:", error);
      toast.error("Erro ao atualizar especialidade.");
    }
  };

  // =============================
  // 🔹 Excluir especialidade
  // =============================
  const handleExcluir = async (id: number): Promise<void> => {
    const confirmar = confirm("Tem certeza que deseja excluir esta especialidade?");
    if (!confirmar) return;

    try {
      await api.delete(`/recepcionista/especialidades/${id}`);
      toast.success("Especialidade removida!");
      await carregarEspecialidades();
    } catch (error) {
      console.error("Erro ao excluir especialidade:", error);
      toast.error("Erro ao excluir especialidade.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gerenciar Especialidades</h2>

      {/* Adicionar nova */}
      <form onSubmit={handleCriar} className="flex gap-2">
        <input
          type="text"
          placeholder="Nome da especialidade"
          value={novaEspecialidade}
          onChange={(e) => setNovaEspecialidade(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Adicionar
        </button>
      </form>

      {/* Tabela */}
      {carregando ? (
        <p className="text-gray-600">Carregando especialidades...</p>
      ) : especialidades.length === 0 ? (
        <p className="text-gray-600">Nenhuma especialidade cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Profissionais</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.map((esp) => (
                <tr key={esp.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{esp.id}</td>
                  <td className="p-3">
                    {editando?.id === esp.id ? (
                      <input
                        type="text"
                        value={editando.nome}
                        onChange={(e) =>
                          setEditando({ ...editando, nome: e.target.value })
                        }
                        className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      esp.nome
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {esp.profissionaisCount ?? "-"}
                  </td>
                  <td className="p-3 flex gap-2">
                    {editando?.id === esp.id ? (
                      <>
                        <button
                          onClick={handleSalvarEdicao}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditando(null)}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditando(esp)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(esp.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
