// src/pages/recepcionista/components/AgendamentosManager.tsx
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";

interface Agendamento {
  id: number;
  data: string;
  status: string;
  paciente: { nome: string } | null;
  profissional: {
    usuario: { nome: string };
    especialidade: { nome: string };
  } | null;
}

export default function AgendamentosManager() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  async function carregarAgendamentos() {
    try {
      const res = await api.get("/recepcionista/agendamentos");
      setAgendamentos(res.data);
    } catch {
      toast.error("Erro ao carregar agendamentos");
    }
  }

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  async function handleStatus(id: number, novoStatus: string) {
    try {
      await api.put(`/recepcionista/agendamentos/${id}`, { status: novoStatus });
      toast.success(`Status atualizado para ${novoStatus}`);
      await carregarAgendamentos();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  return (
    <div className="bg-white shadow rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Agendamentos</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Paciente</th>
              <th className="p-2 text-left">Profissional</th>
              <th className="p-2 text-left">Especialidade</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{new Date(a.data).toLocaleString("pt-BR")}</td>
                <td className="p-2">{a.paciente?.nome || "-"}</td>
                <td className="p-2">{a.profissional?.usuario?.nome || "-"}</td>
                <td className="p-2">{a.profissional?.especialidade?.nome || "-"}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleStatus(a.id, "CONFIRMADO")} className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">Confirmar</button>
                  <button onClick={() => handleStatus(a.id, "CANCELADO")} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Cancelar</button>
                </td>
              </tr>
            ))}
            {agendamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500 italic">Nenhum agendamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
