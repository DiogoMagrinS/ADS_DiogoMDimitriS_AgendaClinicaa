import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function listarUsuarios() {
  return prisma.usuario.findMany();
}

export async function buscarUsuarioPorId(id: number) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new Error('Usuário não encontrado');
  return usuario;
}

export async function criarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  tipo: string;
}) {
  const senhaHash = await bcrypt.hash(dados.senha, 10);
  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      tipo: dados.tipo as any
    },
  });
}

export async function atualizarUsuario(
  id: number,
  dados: Partial<{ nome: string; email: string; senha: string; tipo: string }>
) {
  const camposAtualizaveis: any = {};

  if (dados.nome) camposAtualizaveis.nome = dados.nome;
  if (dados.email) camposAtualizaveis.email = dados.email;
  if (dados.tipo) camposAtualizaveis.tipo = dados.tipo;
  if (dados.senha) {
    camposAtualizaveis.senha = await bcrypt.hash(dados.senha, 10);
  }

  return prisma.usuario.update({
    where: { id },
    data: camposAtualizaveis,
  });
}
export async function excluirUsuario(id: number) {
  return prisma.usuario.delete({
    where: { id },
  });
}

export async function atualizarPerfil(id: number, dados: { nome?: string, email?: string }) {
  return prisma.usuario.update({
    where: { id },
    data: dados,
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
    },
  });
}

export async function alterarSenha(id: number, senhaAtual: string, novaSenha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new Error('Usuário não encontrado.');

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!senhaCorreta) throw new Error('Senha atual incorreta.');

  const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.usuario.update({
    where: { id },
    data: { senha: novaSenhaHash }
  });
}
