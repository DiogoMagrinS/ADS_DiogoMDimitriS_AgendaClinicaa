import { Request, Response } from 'express';
import { PrismaClient, StatusAgendamento } from '@prisma/client';
import {
  listarAgendamentos,
  buscarAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
  listarAgendamentosDoUsuario,
  atualizarObservacoes,
  listarHistoricoStatus,
  listarAgendamentosDoProfissional
} from '../services/agendamentoService';

const prisma = new PrismaClient();

export async function getAgendamentos(req: Request, res: Response) {
  const lista = await listarAgendamentos();
  res.json(lista);
}

export async function getAgendamentoPorId(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const item = await buscarAgendamentoPorId(id);
    res.json(item);
  } catch {
    res.status(404).json({ erro: 'Agendamento não encontrado' });
  }
}

export async function postAgendamento(req: Request, res: Response) {
  try {
    const { pacienteId, profissionalId, data } = req.body;

    // Validações básicas
    if (!pacienteId || !profissionalId || !data) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios: pacienteId, profissionalId e data são necessários.' 
      });
    }

    if (typeof pacienteId !== 'number' || typeof profissionalId !== 'number') {
      return res.status(400).json({ 
        erro: 'pacienteId e profissionalId devem ser números.' 
      });
    }

    // Verifica se a data é válida
    const dataAgendamento = new Date(data);
    if (isNaN(dataAgendamento.getTime())) {
      return res.status(400).json({ 
        erro: 'Data inválida. Use o formato ISO (ex: 2024-01-15T10:00:00.000Z).' 
      });
    }

    const novo = await criarAgendamento({
      pacienteId,
      profissionalId,
      data: dataAgendamento,
      observacoes: req.body.observacoes
    });
    res.status(201).json(novo);
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error);
    res.status(400).json({ erro: error.message || 'Erro ao criar agendamento.' });
  }
}

export async function putAgendamento(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const atualizado = await atualizarAgendamento(id, req.body);
    res.json(atualizado);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
}

export async function deleteAgendamento(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    await excluirAgendamento(id);
    res.status(204).send();
  } catch {
    res.status(404).json({ erro: 'Erro ao deletar agendamento' });
  }
}

export async function listarAgendamentosUsuario(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Token inválido ou ausente.' });
    }

    const usuarioId = req.usuario.id;
    const tipo = req.usuario.tipo;

    if (tipo !== 'PACIENTE') {
      return res.status(403).json({ erro: 'Acesso permitido apenas para pacientes.' });
    }

    const agendamentos = await listarAgendamentosDoUsuario(usuarioId);
    res.json(agendamentos);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
}

export async function editarObservacoes(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { observacoes } = req.body;

    // Permite observações vazias (opcional)
    if (observacoes !== undefined && typeof observacoes !== 'string') {
      return res.status(400).json({ erro: 'Observações devem ser uma string.' });
    }

    const atualizado = await atualizarObservacoes(id, observacoes || '');
    res.json(atualizado);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
}

export async function getHistoricoStatus(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const historico = await listarHistoricoStatus(id);
    res.json(historico);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
}

export async function listarAgendamentosProfissional(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ erro: "Token inválido ou ausente." });
    }

    const usuarioId = req.usuario.id;
    const tipo = req.usuario.tipo;

    if (tipo !== "PROFISSIONAL") {
      return res.status(403).json({ erro: "Acesso permitido apenas para profissionais." });
    }

    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
    });

    if (!profissional) {
      return res.status(404).json({ erro: "Profissional não encontrado." });
    }

    const { data } = req.query;
    const agendamentos = await listarAgendamentosDoProfissional(profissional.id, data as string);

    return res.json(agendamentos);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ erro: error.message });
  }
}

// 🔄 Atualizar status do agendamento
export async function atualizarStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body; // esperado: 'CONFIRMADO', 'CANCELADO' ou 'FINALIZADO'

    if (!['CONFIRMADO', 'CANCELADO', 'FINALIZADO'].includes(status)) {
      return res.status(400).json({ erro: 'Status inválido.' });
    }

    // Busca o agendamento antes de atualizar para enviar notificações
    const agendamentoAntes = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        paciente: true,
        profissional: {
          include: { usuario: true }
        }
      }
    });

    if (!agendamentoAntes) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: { status },
      include: {
        paciente: true,
        profissional: {
          include: { usuario: true }
        }
      }
    });

    // Envia notificações baseado no status
    const { enviarNotificacao } = await import('../services/notificacaoService');
    
    if (status === 'FINALIZADO' && atualizado.paciente.telefone) {
      await enviarNotificacao({
        tipo: 'POS_CONSULTA',
        canal: 'WHATSAPP',
        destinatario: {
          idUsuario: atualizado.pacienteId,
          tipoUsuario: atualizado.paciente.tipo,
          nome: atualizado.paciente.nome,
          telefone: atualizado.paciente.telefone,
        },
        conteudo: '',
        meta: {
          profissional: atualizado.profissional.usuario.nome,
          observacoes: atualizado.observacoes,
        },
        agendamentoId: atualizado.id,
      });
    } else if (status === 'CONFIRMADO' && atualizado.paciente.telefone) {
      await enviarNotificacao({
        tipo: 'CONFIRMACAO_PRESENCA',
        canal: 'WHATSAPP',
        destinatario: {
          idUsuario: atualizado.pacienteId,
          tipoUsuario: atualizado.paciente.tipo,
          nome: atualizado.paciente.nome,
          telefone: atualizado.paciente.telefone,
        },
        conteudo: '',
        meta: {
          data: new Date(atualizado.data).toLocaleString('pt-BR'),
          profissional: atualizado.profissional.usuario.nome,
        },
        agendamentoId: atualizado.id,
      });
    }

    res.json(atualizado);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ erro: error.message });
  }
}

// ⏰ Cancela automaticamente agendamentos antigos não confirmados
export async function cancelarAgendamentosAntigos(prisma: PrismaClient) {
  const agora = new Date();

  await prisma.agendamento.updateMany({
    where: {
      data: { lt: agora },
      status: { in: [StatusAgendamento.AGENDADO, StatusAgendamento.CONFIRMADO] },
    },
    data: { status: StatusAgendamento.CANCELADO },
  });
}
