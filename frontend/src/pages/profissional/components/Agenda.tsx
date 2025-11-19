import AgendamentoCard from './AgendamentoCard';

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

interface AgendaProps {
  agendamentosAgrupados: Record<string, Agendamento[]>;
  onStatusChange: (id: number, novoStatus: string) => void;
}

export default function Agenda({ agendamentosAgrupados, onStatusChange }: AgendaProps) {
  const datasOrdenadas = Object.keys(agendamentosAgrupados).sort(
    (a, b) =>
      new Date(a.split('/').reverse().join('-')).getTime() -
      new Date(b.split('/').reverse().join('-')).getTime()
  );

  return (
    <div className="space-y-8">
      {datasOrdenadas.map((data) => (
        <div key={data}>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-l-4 border-green-500 pl-3 capitalize">
            {data}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agendamentosAgrupados[data].map((agendamento) => (
              <AgendamentoCard
                key={agendamento.id}
                agendamento={agendamento}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
