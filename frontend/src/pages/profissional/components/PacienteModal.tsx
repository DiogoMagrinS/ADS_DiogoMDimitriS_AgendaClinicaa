import { X } from 'lucide-react';

interface Paciente {
  nome: string;
  email: string;
  telefone?: string;
}

interface PacienteModalProps {
  paciente: Paciente | null;
  onClose: () => void;
}

export default function PacienteModal({ paciente, onClose }: PacienteModalProps) {
  if (!paciente) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          Detalhes do Paciente
        </h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Nome:</span> {paciente.nome}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {paciente.email}
          </p>
          {paciente.telefone && (
            <p>
              <span className="font-semibold">Telefone:</span> {paciente.telefone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
