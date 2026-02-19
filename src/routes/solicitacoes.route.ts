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

const solicitacoesRouter = Router();

solicitacoesRouter.post(
  "/solicitacoes",
  authenticateToken,
  validateRequest("body", createSolicitacaoSchema),
  postSolicitacoes
);

// Protegida para somente modelagem e gerentes e portaria
solicitacoesRouter.get(
  "/solicitacoes",
  authenticateToken,
  validateRequest("query", listSolicitacaoQuerySchema),
  getSolicitacoes
);

// Colocar rota protegida por autenticação quando implementada para somente gerente e portaria
solicitacoesRouter.get("/solicitacoes/:id", authenticateToken, getSolicitacaoById);

solicitacoesRouter.post("/solicitacoes/:id/aprovar", authenticateToken, postSolicitacaoAprovar);
solicitacoesRouter.post("/solicitacoes/:id/rejeitar", authenticateToken, postSolicitacaoRejeitar);
solicitacoesRouter.post(
  "/solicitacoes/:id/cancelar",
  authenticateToken,
  validateRequest("body", cancelSolicitacaoSchema),
  postSolicitacaoCancelar
);

export default solicitacoesRouter;
