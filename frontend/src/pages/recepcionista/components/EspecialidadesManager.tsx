// src/pages/recepcionista/components/EspecialidadesManager.tsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";

interface Especialidade {
  id: number;
  nome: string;
}

export default function EspecialidadesManager() {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novaEspecialidade, setNovaEspecialidade] = useState("");
  const [editando, setEditando] = useState<Especialidade | null>(null);

  async function carregarEspecialidades() {
    try {
      const res = await api.get("/recepcionista/especialidades");
      setEspecialidades(res.data);
    } catch {
      toast.error("Erro ao carregar especialidades");
    }
  }

  useEffect(() => {
    carregarEspecialidades();
  }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/recepcionista/especialidades/${editando.id}`, {
          nome: novaEspecialidade,
        });
        toast.success("Especialidade atualizada!");
        setEditando(null);
      } else {
        await api.post("/recepcionista/especialidades", { nome: novaEspecialidade });
        toast.success("Especialidade adicionada!");
      }
      setNovaEspecialidade("");
      await carregarEspecialidades();
    } catch {
      toast.error("Erro ao salvar especialidade");
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm("Excluir esta especialidade?")) return;
    try {
      await api.delete(`/recepcionista/especialidades/${id}`);
      toast.success("Removida com sucesso!");
      await carregarEspecialidades();
    } catch {
      toast.error("Erro ao excluir especialidade");
    }
  }

  return (
    <div className="bg-white shadow rounded-xl p-5 space-y-4">
      <form onSubmit={handleSalvar} className="flex gap-2">
        <input
          type="text"
          placeholder="Nome da especialidade"
          value={novaEspecialidade}
          onChange={(e) => setNovaEspecialidade(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {editando ? "Salvar" : "Adicionar"}
        </button>
        {editando && (
          <button
            type="button"
            onClick={() => {
              setEditando(null);
              setNovaEspecialidade("");
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            Cancelar
          </button>
        )}
      </form>

      <table className="w-full text-sm border border-gray-200 rounded-lg">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {especialidades.map((esp) => (
            <tr key={esp.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{esp.nome}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => {
                    setEditando(esp);
                    setNovaEspecialidade(esp.nome);
                  }}
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(esp.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {especialidades.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center py-4 text-gray-500 italic">
                Nenhuma especialidade cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
