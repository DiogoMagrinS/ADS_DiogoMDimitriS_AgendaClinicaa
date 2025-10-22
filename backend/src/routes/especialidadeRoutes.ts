import { Router } from "express";
import {
  listarEspecialidades,
  criarEspecialidade,
  excluirEspecialidade,
} from "../controllers/especialidadeController";

const router = Router();

router.get("/", listarEspecialidades);
router.post("/", criarEspecialidade);
router.delete("/:id", excluirEspecialidade);

export default router;
