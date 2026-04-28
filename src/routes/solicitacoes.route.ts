import { Router } from "express";
import {
  getSolicitacaoById,
  getSolicitacoesSeparacao,
  getSolicitacoesTroca,
  getSolicitacoes,
  postSolicitacaoAprovar,
  postSolicitacaoAprovarTroca,
  postSolicitacaoCancelar,
  postSolicitacaoRejeitar,
  postSolicitacaoSeparar,
  postSolicitacoes,
} from "../controllers/solicitacao.controller";
import { validateRequest } from "../middleware/validate.middleware";
import {
  aprovarSolicitacaoSchema,
  cancelSolicitacaoSchema,
  createSolicitacaoSchema,
  listSolicitacaoSeparacaoQuerySchema,
  listSolicitacaoQuerySchema,
  separarSolicitacaoSchema,
} from "../schemas/solicitacao.schema";
import { authenticateToken } from "../middleware/auth.middleware";
import { createSolicitation } from "../middleware/createSolicitation.middleware";
import { isManager } from "../middleware/manager.middleware";
import { canSeparate } from "../middleware/canSeparate.middleware";
import { canApproveTroca } from "../middleware/canApproveTroca.middleware";

const solicitacoesRouter = Router();

solicitacoesRouter.post(
  "/solicitacoes",
  authenticateToken,
  validateRequest("body", createSolicitacaoSchema),
  createSolicitation,
  postSolicitacoes
);

solicitacoesRouter.get(
  "/solicitacoes/separacao",
  authenticateToken,
  canSeparate,
  validateRequest("query", listSolicitacaoSeparacaoQuerySchema),
  getSolicitacoesSeparacao
);

solicitacoesRouter.get(
  "/solicitacoes/trocas",
  authenticateToken,
  canApproveTroca,
  validateRequest("query", listSolicitacaoSeparacaoQuerySchema),
  getSolicitacoesTroca
);

solicitacoesRouter.get(
  "/solicitacoes",
  authenticateToken,
  validateRequest("query", listSolicitacaoQuerySchema),
  getSolicitacoes
);

solicitacoesRouter.get("/solicitacoes/:id", authenticateToken, getSolicitacaoById);

solicitacoesRouter.post(
  "/solicitacoes/:id/separar",
  authenticateToken,
  canSeparate,
  validateRequest("body", separarSolicitacaoSchema),
  postSolicitacaoSeparar
);

solicitacoesRouter.post(
  "/solicitacoes/:id/aprovar",
  authenticateToken,
  isManager,
  validateRequest("body", aprovarSolicitacaoSchema),
  postSolicitacaoAprovar
);

solicitacoesRouter.post(
  "/solicitacoes/:id/aprovar-troca",
  authenticateToken,
  isManager,
  canApproveTroca,
  postSolicitacaoAprovarTroca
);
solicitacoesRouter.post("/solicitacoes/:id/rejeitar", authenticateToken, isManager, postSolicitacaoRejeitar);
solicitacoesRouter.post(
  "/solicitacoes/:id/cancelar",
  authenticateToken,
  validateRequest("body", cancelSolicitacaoSchema),
  postSolicitacaoCancelar
);

export default solicitacoesRouter;
