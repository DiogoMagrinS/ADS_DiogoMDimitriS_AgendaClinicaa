import { PrismaClient, StatusAgendamento } from '@prisma/client';
import { enviarNotificacao } from './notificacaoService';

const prisma = new PrismaClient();

export async function listarAgendamentos() {
  return prisma.agendamento.findMany({
    include: {
      paciente: true,
      profissional: {
        include: {
          usuario: true,
          especialidade: true
        }
      }
    }
  });
}

export async function buscarAgendamentoPorId(id: number) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
    include: {
      paciente: true,
      profissional: {
        include: { usuario: true, especialidade: true }
      }
    }
  });
  if (!agendamento) throw new Error();
  return agendamento;
}

export async function criarAgendamento(data: {
  pacienteId: number;
  profissionalId: number;
  data: Date;
  observacoes?: string;
}) {
  const profissional = await prisma.profissional.findUnique({
    where: { id: data.profissionalId }
  });

  if (!profissional) throw new Error('Profissional inválido');

  const dataAgendamento = new Date(data.data);

  if (dataAgendamento <= new Date()) {
    throw new Error('Data deve ser futura');
  }

  const conflito = await prisma.agendamento.findFirst({
    where: {
      profissionalId: data.profissionalId,
      data: dataAgendamento
    }
  });

  if (conflito) throw new Error('Horário já agendado');

  const agendamento = await prisma.agendamento.create({
    data: {
      pacienteId: data.pacienteId,
      profissionalId: data.profissionalId,
      data: dataAgendamento,
      observacoes: data.observacoes
    }
  });

  const paciente = await prisma.usuario.findUnique({ where: { id: data.pacienteId } });
  const profissionalUsuario = await prisma.profissional.findUnique({
    where: { id: data.profissionalId },
    include: { usuario: true },
  });

  if (paciente) {
    await enviarNotificacao({
      tipo: 'EDICAO',
      canal: 'WHATSAPP',
      destinatario: {
        idUsuario: paciente.id,
        tipoUsuario: paciente.tipo,
        nome: paciente.nome,
        telefone: paciente.telefone,
      },
      conteudo: `Seu agendamento foi criado para ${dataAgendamento.toLocaleString('pt-BR')}.`,
      meta: { agendamentoId: agendamento.id },
      agendamentoId: agendamento.id,
    });
  }

  if (profissionalUsuario?.usuario) {
    await enviarNotificacao({
      tipo: 'EDICAO',
      canal: 'WHATSAPP',
      destinatario: {
        idUsuario: profissionalUsuario.usuario.id,
        tipoUsuario: profissionalUsuario.usuario.tipo,
        nome: profissionalUsuario.usuario.nome,
        telefone: profissionalUsuario.usuario.telefone,
      },
      conteudo: `Novo agendamento marcado para ${dataAgendamento.toLocaleString('pt-BR')}.`,
      meta: { agendamentoId: agendamento.id },
      agendamentoId: agendamento.id,
    });
  }

  return agendamento;
}

export async function atualizarAgendamento(
  id: number,
  dados: Partial<{
    pacienteId: number;
    profissionalId: number;
    data: Date;
    status: string;
  }>
) {
  const agendamentoExistente = await prisma.agendamento.findUnique({
    where: { id },
    include: {
      paciente: true,
      profissional: { include: { usuario: true } },
    }
  });

  if (!agendamentoExistente) throw new Error('Agendamento não encontrado');

  const dataAtualizada = dados.data ? new Date(dados.data) : undefined;

  if (dataAtualizada && dataAtualizada <= new Date()) {
    throw new Error('A data do agendamento deve estar no futuro');
  }

  if (dados.profissionalId && dataAtualizada) {
    const conflito = await prisma.agendamento.findFirst({
      where: {
        profissionalId: dados.profissionalId,
        data: dataAtualizada,
        NOT: { id }
      }
    });

    if (conflito) {
      throw new Error('Este horário já está ocupado para o profissional');
    }
  }

  // Verifica se o status mudou
  const statusAlterado = dados.status && dados.status !== agendamentoExistente.status;

  // Atualiza o agendamento
  const dataAnterior = agendamentoExistente.data;

  const atualizado = await prisma.agendamento.update({
    where: { id },
    data: {
      pacienteId: dados.pacienteId,
      profissionalId: dados.profissionalId,
      data: dataAtualizada,
      status: dados.status as any
    }
  });

  // Se o status foi alterado, registra no histórico
  if (statusAlterado) {
    await prisma.historicoStatus.create({
      data: {
        agendamentoId: id,
        status: dados.status as any
      }
    });
  }

  const paciente = agendamentoExistente.paciente;
  const profissionalUsuario = agendamentoExistente.profissional.usuario;

  const dataMudou =
    dataAtualizada && dataAtualizada.getTime() !== new Date(dataAnterior).getTime();

  if (dataMudou) {
    const resumo = `Nova data/horário: ${dataAtualizada?.toLocaleString('pt-BR')}`;

    if (paciente) {
      await enviarNotificacao({
        tipo: 'EDICAO',
        canal: 'WHATSAPP',
        destinatario: {
          idUsuario: paciente.id,
          tipoUsuario: paciente.tipo,
          nome: paciente.nome,
          telefone: paciente.telefone,
        },
        conteudo: `Seu agendamento foi atualizado. ${resumo}`,
        meta: { agendamentoId: atualizado.id },
        agendamentoId: atualizado.id,
      });
    }

    if (profissionalUsuario) {
      await enviarNotificacao({
        tipo: 'EDICAO',
        canal: 'WHATSAPP',
        destinatario: {
          idUsuario: profissionalUsuario.id,
          tipoUsuario: profissionalUsuario.tipo,
          nome: profissionalUsuario.nome,
          telefone: profissionalUsuario.telefone,
        },
        conteudo: `Um agendamento da sua agenda foi atualizado. ${resumo}`,
        meta: { agendamentoId: atualizado.id },
        agendamentoId: atualizado.id,
      });
    }
  }

  if (dados.status && dados.status === StatusAgendamento.CANCELADO) {
    if (profissionalUsuario) {
      await enviarNotificacao({
        tipo: 'CANCELAMENTO',
        canal: 'WHATSAPP',
        destinatario: {
          idUsuario: profissionalUsuario.id,
          tipoUsuario: profissionalUsuario.tipo,
          nome: profissionalUsuario.nome,
          telefone: profissionalUsuario.telefone,
        },
        conteudo: `Um agendamento foi cancelado (${agendamentoExistente.data.toLocaleString('pt-BR')}).`,
        meta: { agendamentoId: atualizado.id },
        agendamentoId: atualizado.id,
      });
    }
  }

  return atualizado;
}

export async function excluirAgendamento(id: number) {
  return prisma.agendamento.delete({
    where: { id }
  });
}

export async function listarAgendamentosDoUsuario(usuarioId: number) {
  return prisma.agendamento.findMany({
    where: { pacienteId: usuarioId },
    orderBy: { data: 'asc' },
    include: {
      profissional: {
        include: {
          usuario: true,          // ✅ pega todos os dados do usuário
          especialidade: true     // ✅ pega a especialidade correta vinculada ao profissional
        }
      }
    }
  });
}

export async function listarAgendamentosDoProfissional(profissionalId: number, data?: string) {
  const where: any = { profissionalId };

  if (data) {
    const start = new Date(`${data}T00:00:00`);
    const end = new Date(`${data}T23:59:59`);
    where.data = { gte: start, lte: end };
  }

  return prisma.agendamento.findMany({
    where,
    include: {
      paciente: { select: { nome: true, email: true } },
    },
    orderBy: { data: 'asc' },
  });
}

export async function atualizarObservacoes(id: number, observacoes: string) {
  const agendamento = await prisma.agendamento.findUnique({ where: { id } });
  if (!agendamento) throw new Error('Agendamento não encontrado');

  return prisma.agendamento.update({
    where: { id },
    data: { observacoes }
  });
}

export async function listarHistoricoStatus(agendamentoId: number) {
  return prisma.historicoStatus.findMany({
    where: { agendamentoId },
    orderBy: { dataHora: 'asc' }
  });
}
