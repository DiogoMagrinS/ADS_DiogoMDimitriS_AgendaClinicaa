import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

// ====================
// 🧩 PACIENTES / USUÁRIOS
// ====================

// Listar todos os usuários (pacientes, profissionais e recepcionistas)
export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        profissional: {
          include: {
            especialidade: true, // 👈 garante que venha o nome da especialidade
          },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao listar usuários." });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      email,
      senha,
      tipo,
      especialidadeId,
      diasAtendimento,
      horaInicio,
      horaFim,
      formacao,
      biografia,
      fotoPerfil,
    } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo,
        profissional:
          tipo === "PROFISSIONAL"
            ? {
                create: {
                  especialidadeId: Number(especialidadeId),
                  diasAtendimento,
                  horaInicio,
                  horaFim,
                  formacao,
                  biografia,
                  fotoPerfil,
                },
              }
            : undefined,
      },
      include: {
        profissional: {
          include: { especialidade: true },
        },
      },
    });

    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};
// Atualizar usuário
export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo } = req.body;

    const atualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { nome, email, tipo },
    });

    res.json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
};

// Excluir usuário
export const deletarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.usuario.delete({ where: { id: Number(id) } });
    res.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir usuário." });
  }
};

// ====================
// 🧩 AGENDAMENTOS
// ====================

// Listar todos os agendamentos (com nomes de paciente e profissional)
export const listarAgendamentos = async (req: Request, res: Response) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        paciente: true,
        profissional: { include: { usuario: true } },
      },
      orderBy: { data: "asc" },
    });
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar agendamentos." });
  }
};

// Atualizar status de um agendamento
export const atualizarAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const agendamento = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar agendamento." });
  }
};

// =======================
// 🧠 ESPECIALIDADES
// =======================

// Listar todas as especialidades
export const listarEspecialidades = async (req: Request, res: Response) => {
  try {
    const especialidades = await prisma.especialidade.findMany({
      orderBy: { nome: "asc" },
    });
    return res.json(especialidades);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar especialidades" });
  }
};

// Criar nova especialidade
export const criarEspecialidade = async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "O nome da especialidade é obrigatório." });
    }

    const jaExiste = await prisma.especialidade.findUnique({ where: { nome } });
    if (jaExiste) {
      return res.status(400).json({ error: "Esta especialidade já existe." });
    }

    const nova = await prisma.especialidade.create({ data: { nome } });
    return res.status(201).json(nova);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar especialidade" });
  }
};

// Excluir especialidade
export const excluirEspecialidade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await prisma.especialidade.findUnique({ where: { id: Number(id) } });
    if (!existe) {
      return res.status(404).json({ error: "Especialidade não encontrada." });
    }

    await prisma.especialidade.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao excluir especialidade" });
  }
};
