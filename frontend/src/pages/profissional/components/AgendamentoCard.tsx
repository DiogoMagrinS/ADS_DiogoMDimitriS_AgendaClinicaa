import { CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';

interface Paciente {
  nome: string;
  email: string;
  telefone?: string;
}

interface Agendamento {
  id: number;
  data: string;
  status: string;
  paciente: Paciente;
}

interface Props {
  agendamento: Agendamento;
  onStatusChange: (id: number, novoStatus: string) => void;
}

export default function AgendamentoCard({ agendamento, onStatusChange }: Props) {
  const { id, data, status, paciente } = agendamento;
  const hora = new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColors: Record<string, string> = {
    CONFIRMADO: 'text-green-600 bg-green-100',
    CANCELADO: 'text-red-600 bg-red-100',
    ATENDIDO: 'text-indigo-600 bg-indigo-100',
    PENDENTE: 'text-yellow-600 bg-yellow-100',
  };

  return (
    <div className="bg-white shadow rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">{hora}</p>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            statusColors[status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mb-3">
        <p className="font-semibold text-gray-800">{paciente.nome}</p>
        <p className="text-sm text-gray-500">{paciente.email}</p>
      </div>

      <div className="flex justify-between mt-4">
        {status !== 'ATENDIDO' && (
          <button
            onClick={() => onStatusChange(id, 'ATENDIDO')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition"
          >
            <ClipboardCheck className="w-4 h-4" /> Atendido
          </button>
        )}
        {status !== 'CONFIRMADO' && (
          <button
            onClick={() => onStatusChange(id, 'CONFIRMADO')}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 transition"
          >
            <CheckCircle className="w-4 h-4" /> Confirmar
          </button>
        )}
        {status !== 'CANCELADO' && (
          <button
            onClick={() => onStatusChange(id, 'CANCELADO')}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
          >
            <XCircle className="w-4 h-4" /> Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
