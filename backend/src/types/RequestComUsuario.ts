import { Request } from 'express';
import { TipoUsuario } from '@prisma/client';

export interface RequestComUsuario extends Request {
  usuario: {
    id: number;
    email: string;
    tipo: TipoUsuario;
  };
}


