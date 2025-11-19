import { useEffect, useState } from "react";
import { getUserFromToken } from "../utils/getUserFromToken";
import type { DecodedToken } from "../utils/getUserFromToken";
import { Link } from "react-router-dom";
import GlassPage from "../components/GlassPage";

export default function Dashboard() {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const decoded = getUserFromToken();
    setUser(decoded);
  }, []);

  if (!user) {
    return (
      <GlassPage align="center" maxWidthClass="max-w-md" cardClassName="px-6 py-8 text-center">
        <p className="text-gray-600">Carregando dados do usuário...</p>
      </GlassPage>
    );
  }

  return (
    <GlassPage
      maxWidthClass="w-full"
      contentClassName="glass-content"
      className="pb-10"
      withCard={false}
    >
      <div className="space-y-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[var(--ink)]">Dashboard</h1>
          <p className="text-[var(--text-muted)]">
            Bem-vindo, <span className="font-medium text-[var(--ink)]">{user.email}</span>
          </p>
          <span className="inline-block text-xs font-medium text-[var(--sand-600)] bg-[var(--sand-200)] px-3 py-1 rounded-full">
            Perfil: {user.tipo}
          </span>
        </div>

        {user.tipo === "PACIENTE" && (
          <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/paciente/agendamentos"
            className="group block rounded-xl border border-white/40 bg-white/90 p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm"
          >
              <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Meus agendamentos</h2>
              <span className="text-[var(--sand-600)] group-hover:text-[var(--sand-500)]">→</span>
              </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Visualize e gerencie suas consultas.</p>
          </Link>

          <Link
            to="/paciente/novo-agendamento"
            className="group block rounded-xl border border-white/40 bg-white/90 p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm"
          >
              <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Novo agendamento</h2>
              <span className="text-[var(--sand-600)] group-hover:text-[var(--sand-500)]">→</span>
              </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Agende uma nova consulta rapidamente.</p>
          </Link>
        </div>
      )}

      {user.tipo === "PROFISSIONAL" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/profissional/agenda"
            className="group block rounded-xl border border-white/40 bg-white/90 p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Minha agenda</h2>
              <span className="text-[var(--sand-600)] group-hover:text-[var(--sand-500)]">→</span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Veja suas consultas do dia e atualize status.</p>
          </Link>
        </div>
      )}

      {user.tipo === "RECEPCIONISTA" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/recepcionista/gerenciar"
            className="group block rounded-xl border border-white/40 bg-white/90 p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Gerenciar agendamentos</h2>
              <span className="text-[var(--sand-600)] group-hover:text-[var(--sand-500)]">→</span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Administre os agendamentos da clínica.</p>
          </Link>
        </div>
      )}
      </div>
    </GlassPage>
  );
}