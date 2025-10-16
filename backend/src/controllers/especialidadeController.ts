import { Request, Response } from 'express';
import {
  listarEspecialidades,
  buscarEspecialidadePorId,
  criarEspecialidade,
  atualizarEspecialidade,
  excluirEspecialidade
} from '../services/especialidadeService';

export async function getEspecialidades(req: Request, res: Response) {
  const especialidades = await listarEspecialidades();
  res.json(especialidades);
}

export async function getEspecialidadePorId(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const especialidade = await buscarEspecialidadePorId(id);
    res.json(especialidade);
  } catch {
    res.status(404).json({ erro: 'Especialidade não encontrada' });
  }
}

export async function postEspecialidade(req: Request, res: Response) {
  try {
    const especialidade = await criarEspecialidade(req.body.nome);
    res.status(201).json(especialidade);
  } catch {
    res.status(400).json({ erro: 'Erro ao criar especialidade' });
  }
}

export async function putEspecialidade(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const especialidade = await atualizarEspecialidade(id, req.body.nome);
    res.json(especialidade);
  } catch {
    res.status(404).json({ erro: 'Especialidade não encontrada' });
  }
}

export async function deleteEspecialidade(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    await excluirEspecialidade(id);
    res.status(204).send();
  } catch {
    res.status(404).json({ erro: 'Especialidade não encontrada' });
  }
}
