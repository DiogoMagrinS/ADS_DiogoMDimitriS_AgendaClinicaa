import { useEffect, useState } from 'react';
import { getUserFromToken } from '../utils/getUserFromToken';
import type { DecodedToken } from '../utils/getUserFromToken';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const decoded = getUserFromToken();
    setUser(decoded);
  }, []);

  if (!user) return <p className="p-8 text-gray-500">Carregando dados do usuário...</p>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo, <span className="font-medium text-gray-900">{user.email}</span>
          </p>
          <span className="inline-block mt-3 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            Perfil: {user.tipo}
          </span>
        </div>

        {user.tipo === 'PACIENTE' && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              to="/paciente/agendamentos"
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Meus agendamentos</h2>
                <span className="text-blue-600 group-hover:text-blue-700">→</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Visualize e gerencie suas consultas.</p>
            </Link>

            <Link
              to="/paciente/novo-agendamento"
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Novo agendamento</h2>
                <span className="text-blue-600 group-hover:text-blue-700">→</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Agende uma nova consulta rapidamente.</p>
            </Link>
          </div>
        )}

        {user.tipo === 'PROFISSIONAL' && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              to="/profissional/agenda"
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Minha agenda</h2>
                <span className="text-blue-600 group-hover:text-blue-700">→</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Veja suas consultas do dia e atualize status.</p>
            </Link>
          </div>
        )}

        {user.tipo === 'RECEPCIONISTA' && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              to="/recepcionista/gerenciar"
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gerenciar agendamentos</h2>
                <span className="text-blue-600 group-hover:text-blue-700">→</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Administre os agendamentos da clínica.</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}