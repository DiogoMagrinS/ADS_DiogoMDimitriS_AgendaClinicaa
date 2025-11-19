import { Router, Request, Response, NextFunction } from 'express';
import {
  getUsuarios,
  getUsuarioPorId,
  postUsuario,
  putUsuario,
  deleteUsuario,
  atualizarPerfilUsuario,
  alterarSenhaUsuario
} from '../controllers/usuarioController';
import { autenticarToken } from '../middlewares/authMiddleware';
import { RequestComUsuario } from '../types/RequestComUsuario';

const router = Router();

router.use(autenticarToken);

router.get('/', getUsuarios);
router.get('/:id', getUsuarioPorId);
router.post('/', postUsuario);
router.put('/:id', putUsuario);
router.delete('/:id', deleteUsuario);

router.put('/me', atualizarPerfilUsuario);
router.put('/alterar-senha', (req: Request, res: Response, next: NextFunction) => {
  alterarSenhaUsuario(req as RequestComUsuario, res);
});

export default router;
