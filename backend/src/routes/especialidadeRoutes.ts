import { Router } from 'express';
import {
  getEspecialidades,
  getEspecialidadePorId,
  postEspecialidade,
  putEspecialidade,
  deleteEspecialidade
} from '../controllers/especialidadeController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticarToken); // protege todas as rotas

router.get('/', getEspecialidades);
router.get('/:id', getEspecialidadePorId);
router.post('/', postEspecialidade);
router.put('/:id', putEspecialidade);
router.delete('/:id', deleteEspecialidade);

export default router;
