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
    onClose: () => void;
  }
  
  export default function PacienteModal({ agendamento, onClose }: Props) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados do Paciente</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="text-gray-500">Nome:</span> <span className="font-medium text-gray-900">{agendamento.paciente.nome}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{agendamento.paciente.email}</span></p>
            <p><span className="text-gray-500">Horário:</span> <span className="font-medium text-gray-900">{agendamento.hora}</span></p>
            <p><span className="text-gray-500">Status:</span> <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{agendamento.status}</span></p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }
  