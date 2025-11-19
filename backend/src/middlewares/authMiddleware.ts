import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function autenticarToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, usuario) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    (req as any).usuario = usuario;
    next();
  });
}
