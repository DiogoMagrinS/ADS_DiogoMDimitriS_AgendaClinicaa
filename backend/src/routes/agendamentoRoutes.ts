import { Router } from 'express';
import {
  getAgendamentos,
  getAgendamentoPorId,
  postAgendamento,
  putAgendamento,
  deleteAgendamento,
  atualizarStatus,
  listarAgendamentosUsuario,
  listarAgendamentosProfissional
} from '../controllers/agendamentoController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticarToken);

// ⚠️ coloque /me ANTES de '/:id' para não conflitar
router.get('/me', listarAgendamentosUsuario);
router.patch('/:id/status', autenticarToken, atualizarStatus);
router.get('/', getAgendamentos);
router.get('/:id', getAgendamentoPorId);
router.post('/', postAgendamento);
router.put('/:id', putAgendamento);
router.delete('/:id', deleteAgendamento);
router.get('/profissional/me', listarAgendamentosProfissional);

router.get('/me', autenticarToken, listarAgendamentosUsuario);
router.get('/me/profissional', autenticarToken, listarAgendamentosProfissional);
export default router;
