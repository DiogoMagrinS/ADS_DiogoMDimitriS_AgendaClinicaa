import { Router } from 'express';
import {
  getAgendamentos,
  getAgendamentoPorId,
  postAgendamento,
  putAgendamento,
  deleteAgendamento,
  atualizarStatus,
  listarAgendamentosUsuario,
  listarAgendamentosProfissional,
  editarObservacoes

} from '../controllers/agendamentoController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticarToken);

// ⚠️ coloque /me ANTES de '/:id' para não conflitar
router.get('/me', listarAgendamentosUsuario);
router.get('/profissional/me', listarAgendamentosProfissional);
router.patch('/:id/status', atualizarStatus);
router.patch('/:id/observacoes', editarObservacoes);

router.get('/', getAgendamentos);
router.get('/:id', getAgendamentoPorId);
router.post('/', postAgendamento);
router.put('/:id', putAgendamento);
router.delete('/:id', deleteAgendamento);


router.get('/me', autenticarToken, listarAgendamentosUsuario);
router.get('/me/profissional', autenticarToken, listarAgendamentosProfissional);
export default router;
