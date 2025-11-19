import { PrismaClient } from '@prisma/client';
import { whatsappService } from './whatsappService';

const prisma = new PrismaClient();

interface Destinatario {
  idUsuario: number;
  tipoUsuario: string;
  nome: string;
  telefone?: string | null;
}

interface DadosNotificacao {
  tipo: 'LEMBRETE' | 'CANCELAMENTO' | 'EDICAO' | 'POS_CONSULTA' | 'CONFIRMACAO_PRESENCA';
  canal: 'WHATSAPP';
  destinatario: Destinatario;
  conteudo: string;
  meta?: Record<string, any>;
  agendamentoId?: number;
}
/**
 * Templates de mensagens para diferentes tipos de notificações
 */
const templatesMensagem = {
  AGENDAMENTO_CRIADO: (data: string, profissional: string) =>
    `✅ *Agendamento Confirmado*\n\n` +
    `Seu agendamento foi marcado com sucesso!\n\n` +
    `📅 *Data/Hora:* ${data}\n` +
    `👨‍⚕️ *Profissional:* ${profissional}\n\n` +
    `Lembre-se de comparecer no horário agendado.`,

  AGENDAMENTO_CANCELADO: (data: string) =>
    `❌ *Agendamento Cancelado*\n\n` +
    `Seu agendamento do dia ${data} foi cancelado.\n\n` +
    `Se precisar reagendar, entre em contato conosco.`,

  AGENDAMENTO_ATUALIZADO: (dataAntiga: string, dataNova: string) =>
    `🔄 *Agendamento Atualizado*\n\n` +
    `Seu agendamento foi alterado:\n\n` +
    `📅 *Data Anterior:* ${dataAntiga}\n` +
    `📅 *Nova Data:* ${dataNova}\n\n` +
    `Por favor, confirme sua presença na nova data.`,

  AGENDAMENTO_CONFIRMADO: (data: string, profissional: string) =>
    `✅ *Agendamento Confirmado*\n\n` +
    `Seu agendamento foi confirmado:\n\n` +
    `📅 *Data/Hora:* ${data}\n` +
    `👨‍⚕️ *Profissional:* ${profissional}\n\n` +
    `Aguardamos você no horário agendado!`,

  LEMBRETE_AGENDAMENTO: (data: string, profissional: string, horasAntecedencia: number = 24) =>
    `⏰ *Lembrete de Agendamento*\n\n` +
    `Você tem um agendamento em breve:\n\n` +
    `📅 *Data/Hora:* ${data}\n` +
    `👨‍⚕️ *Profissional:* ${profissional}\n\n` +
    `Não se esqueça de comparecer!`,

  AGENDAMENTO_FINALIZADO: (profissional: string, observacoes?: string) =>
    `✅ *Atendimento Finalizado*\n\n` +
    `Seu atendimento com ${profissional} foi finalizado.\n\n` +
    (observacoes ? `📝 *Observações do Profissional:*\n${observacoes}\n\n` : '') +
    `Avalie seu atendimento através do nosso sistema.`,

  NOVO_AGENDAMENTO_PROFISSIONAL: (data: string, paciente: string) =>
    `📅 *Novo Agendamento*\n\n` +
    `Você tem um novo agendamento:\n\n` +
    `📅 *Data/Hora:* ${data}\n` +
    `👤 *Paciente:* ${paciente}\n\n` +
    `Prepare-se para o atendimento.`,
};

/**
 * Gera o conteúdo da mensagem baseado no tipo de notificação
 */
function gerarConteudoMensagem(
  tipo: string,
  conteudo: string,
  meta?: Record<string, any>
): string {
  // Se já tem conteúdo customizado, usa ele
  if (conteudo && conteudo.trim()) {
    return conteudo;
  }

  // Caso contrário, usa templates baseados no tipo
  switch (tipo) {
    case 'EDICAO':
      // Verifica se é novo agendamento ou atualização
      if (meta?.tipo === 'NOVO_AGENDAMENTO') {
        return templatesMensagem.NOVO_AGENDAMENTO_PROFISSIONAL(
          meta?.data || 'Data do agendamento',
          meta?.paciente || 'Paciente'
        );
      }
      // Se tem profissional, é criação de agendamento para paciente
      if (meta?.profissional) {
        return templatesMensagem.AGENDAMENTO_CRIADO(
          meta?.data || 'Data do agendamento',
          meta?.profissional || 'Profissional'
        );
      }
      return templatesMensagem.AGENDAMENTO_ATUALIZADO(
        meta?.dataAnterior || 'Data anterior',
        meta?.dataNova || meta?.data || 'Nova data'
      );
    case 'CANCELAMENTO':
      return templatesMensagem.AGENDAMENTO_CANCELADO(meta?.data || 'Data do agendamento');
    case 'LEMBRETE':
      return templatesMensagem.LEMBRETE_AGENDAMENTO(
        meta?.data || 'Data do agendamento',
        meta?.profissional || 'Profissional'
      );
    case 'POS_CONSULTA':
      return templatesMensagem.AGENDAMENTO_FINALIZADO(
        meta?.profissional || 'Profissional',
        meta?.observacoes
      );
    case 'CONFIRMACAO_PRESENCA':
      return templatesMensagem.AGENDAMENTO_CONFIRMADO(
        meta?.data || 'Data do agendamento',
        meta?.profissional || 'Profissional'
      );
    default:
      return conteudo || 'Notificação do sistema de agendamento.';
  }
}

/**
 * Envia uma notificação via WhatsApp
 */
export async function enviarNotificacao(dados: DadosNotificacao): Promise<void> {
  try {
    // Valida se tem telefone
    if (!dados.destinatario.telefone) {
      console.warn(`Usuário ${dados.destinatario.nome} não possui telefone cadastrado.`);
      return;
    }

    // Gera o conteúdo da mensagem
    const mensagem = gerarConteudoMensagem(dados.tipo, dados.conteudo, dados.meta);

    // Cria registro de notificação no banco
    const notificacao = await (prisma as any).notificacao.create({
      data: {
        tipo: dados.tipo as any,
        canal: dados.canal as any,
        destinatarioId: dados.destinatario.idUsuario,
        destinatarioTipo: dados.destinatario.tipoUsuario as any,
        conteudo: mensagem,
        meta: dados.meta || {},
        status: 'CRIADA' as any,
        agendamentoId: dados.agendamentoId,
      },
    });

    // Envia via WhatsApp
    const resultado = await whatsappService.enviarMensagemTexto({
      numero: dados.destinatario.telefone,
      mensagem: mensagem,
    });

    // Atualiza status da notificação
    if (resultado.success) {
      await (prisma as any).notificacao.update({
        where: { id: notificacao.id },
        data: {
          status: 'ENVIADA' as any,
        },
      });
      console.log(`Notificação enviada com sucesso para ${dados.destinatario.nome}`);
    } else {
      await (prisma as any).notificacao.update({
        where: { id: notificacao.id },
        data: {
          status: 'FALHOU' as any,
          detalhesErro: resultado.error || 'Erro desconhecido',
        },
      });
      console.error(`Erro ao enviar notificação para ${dados.destinatario.nome}:`, resultado.error);
    }
  } catch (error: any) {
    console.error('Erro ao processar notificação:', error);
    throw error;
  }
}

/**
 * Envia lembretes automáticos de agendamentos
 * Deve ser executado periodicamente (ex: via cron job)
 */
export async function enviarLembretesAgendamentos(): Promise<void> {
  try {
    const agora = new Date();
    const em24Horas = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

    // Busca agendamentos confirmados que acontecerão em 24 horas
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        status: 'CONFIRMADO',
        data: {
          gte: agora,
          lte: em24Horas,
        },
      },
      include: {
        paciente: true,
        profissional: {
          include: {
            usuario: true,
          },
        },
      },
    });

    for (const agendamento of agendamentos) {
      // Verifica se já foi enviado lembrete
      const lembreteEnviado = await (prisma as any).notificacao.findFirst({
        where: {
          agendamentoId: agendamento.id,
          tipo: 'LEMBRETE',
          status: 'ENVIADA',
        },
      });

      if (!lembreteEnviado && agendamento.paciente.telefone) {
        await enviarNotificacao({
          tipo: 'LEMBRETE',
          canal: 'WHATSAPP',
          destinatario: {
            idUsuario: agendamento.pacienteId,
            tipoUsuario: agendamento.paciente.tipo,
            nome: agendamento.paciente.nome,
            telefone: agendamento.paciente.telefone,
          },
          conteudo: '',
          meta: {
            data: agendamento.data.toLocaleString('pt-BR'),
            profissional: agendamento.profissional.usuario.nome,
          },
          agendamentoId: agendamento.id,
        });
      }
    }
  } catch (error) {
    console.error('Erro ao enviar lembretes:', error);
  }
}


