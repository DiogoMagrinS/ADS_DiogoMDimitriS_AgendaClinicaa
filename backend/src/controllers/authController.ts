import { Request, Response } from 'express';
import { autenticarUsuario } from '../services/authService';

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;
    const resultado = await autenticarUsuario(email, senha);
    res.json(resultado);
  } catch (error: any) {
    res.status(401).json({ erro: error.message });
  }
}
