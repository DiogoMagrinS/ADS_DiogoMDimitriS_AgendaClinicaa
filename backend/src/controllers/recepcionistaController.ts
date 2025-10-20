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
      orderBy: { nome: "asc" },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar usuários." });
  }
};

// Criar novo usuário (qualquer tipo)
export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo)
      return res.status(400).json({ error: "Campos obrigatórios faltando." });

    const jaExiste = await prisma.usuario.findUnique({ where: { email } });
    if (jaExiste)
      return res.status(400).json({ error: "E-mail já cadastrado." });

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novo = await prisma.usuario.create({
      data: { nome, email, senha: senhaCriptografada, tipo },
    });

    res.status(201).json(novo);
  } catch (error) {
    console.error(error);
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
