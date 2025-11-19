import { Router } from 'express';
import { listarNotificacoes } from '../controllers/notificacaoController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', autenticarToken, listarNotificacoes);

export default router;


