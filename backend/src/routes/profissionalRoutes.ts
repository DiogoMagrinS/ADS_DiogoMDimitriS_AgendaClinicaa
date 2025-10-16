import { Router } from 'express';
import {
  getProfissionais,
  getProfissionalPorId,
  postProfissional,
  putProfissional,
  deleteProfissional,
  getDisponibilidade
} from '../controllers/profissionalController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticarToken);

// Disponibilidade deve vir antes de '/:id'
router.get('/:id/disponibilidade', getDisponibilidade);

router.get('/', getProfissionais);
router.get('/:id', getProfissionalPorId);
router.post('/', postProfissional);
router.put('/:id', putProfissional);
router.delete('/:id', deleteProfissional);

export default router;
