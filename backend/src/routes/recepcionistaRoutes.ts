import { Router } from "express";
import { autenticarToken } from "../middlewares/authMiddleware";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  listarAgendamentos,
  atualizarAgendamento,
} from "../controllers/recepcionistaController";

const router = Router();

router.use(autenticarToken); // todas as rotas protegidas por JWT

// Usuários
router.get("/usuarios", listarUsuarios);
router.post("/usuarios", criarUsuario);
router.put("/usuarios/:id", atualizarUsuario);
router.delete("/usuarios/:id", deletarUsuario);

// Agendamentos
router.get("/agendamentos", listarAgendamentos);
router.put("/agendamentos/:id", atualizarAgendamento);

export default router;
