interface Agendamento {
    id: number;
    hora: string;
    status: string;
    paciente: {
      nome: string;
      email: string;
    };
  }
  
  interface Props {
    agendamento: Agendamento;
    onAtualizarStatus: (id: number, status: string) => void;
    onVerPaciente: () => void;
  }
  
  export default function AgendamentoCard({ agendamento, onAtualizarStatus, onVerPaciente }: Props) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-900 font-medium">{agendamento.paciente.nome}</p>
          <div className="mt-1 flex gap-4 text-sm text-gray-600">
            <span>Horário: <span className="text-gray-900 font-medium">{agendamento.hora}</span></span>
            <span className="inline-flex items-center gap-2">
              Status:
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{agendamento.status}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {agendamento.status !== "CONFIRMADO" && (
            <button
              className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
              onClick={() => onAtualizarStatus(agendamento.id, "CONFIRMADO")}
            >
              Confirmar
            </button>
          )}
          {agendamento.status !== "CANCELADO" && (
            <button
              className="text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg"
              onClick={() => onAtualizarStatus(agendamento.id, "CANCELADO")}
            >
              Cancelar
            </button>
          )}
          <button
            className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200"
            onClick={onVerPaciente}
          >
            Detalhes
          </button>
        </div>
      </div>
    );
  }
  