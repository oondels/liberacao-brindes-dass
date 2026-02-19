import { Router } from "express";
import {
  getSolicitacaoById,
  getSolicitacoes,
  postSolicitacaoAprovar,
  postSolicitacaoCancelar,
  postSolicitacaoRejeitar,
  postSolicitacoes,
} from "../controllers/solicitacao.controller";
import { validateRequest } from "../middleware/validate.middleware";
import {
  cancelSolicitacaoSchema,
  createSolicitacaoSchema,
  listSolicitacaoQuerySchema,
} from "../schemas/solicitacao.schema";
import { authenticateToken } from "../middleware/auth.middleware";
import { createSolicitation } from "../middleware/createSolicitation.middleware";
import { isManager } from "../middleware/manager.middleware";

const solicitacoesRouter = Router();

solicitacoesRouter.post(
  "/solicitacoes",
  authenticateToken,
  createSolicitation,
  validateRequest("body", createSolicitacaoSchema),
  postSolicitacoes
);

solicitacoesRouter.get(
  "/solicitacoes",
  authenticateToken,
  validateRequest("query", listSolicitacaoQuerySchema),
  getSolicitacoes
);

solicitacoesRouter.get("/solicitacoes/:id", authenticateToken, getSolicitacaoById);

solicitacoesRouter.post("/solicitacoes/:id/aprovar", authenticateToken, isManager, postSolicitacaoAprovar);
solicitacoesRouter.post("/solicitacoes/:id/rejeitar", authenticateToken, isManager, postSolicitacaoRejeitar);
solicitacoesRouter.post(
  "/solicitacoes/:id/cancelar",
  authenticateToken,
  validateRequest("body", cancelSolicitacaoSchema),
  postSolicitacaoCancelar
);

export default solicitacoesRouter;
