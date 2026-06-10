import { Router } from "express";
import {
  getSolicitacaoById,
  getSolicitacoesSeparacao,
  getSolicitacoesTroca,
  getSolicitacoes,
  postSolicitacaoAprovar,
  postSolicitacaoAprovarTroca,
  postSolicitacaoCancelar,
  postSolicitacaoInvalidarVoucher,
  postSolicitacaoRejeitar,
  postSolicitacaoSeparar,
  postSolicitacoes,
  postSolicitacoesLote,
  postSolicitacoesLoteSeparar,
} from "../controllers/solicitacao.controller";
import { validateRequest } from "../middleware/validate.middleware";
import {
  aprovarSolicitacaoSchema,
  cancelSolicitacaoSchema,
  createSolicitacaoSchema,
  invalidarVoucherSchema,
  listSolicitacaoSeparacaoQuerySchema,
  listSolicitacaoQuerySchema,
  separarSolicitacaoSchema,
  separarSolicitacoesLoteSchema,
  createSolicitacaoLoteSchema,
} from "../schemas/solicitacao.schema";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeSolicitacaoView } from "../middleware/authorization.middleware";
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

solicitacoesRouter.post(
  "/solicitacoes/lote",
  authenticateToken,
  validateRequest("body", createSolicitacaoLoteSchema),
  createSolicitation,
  postSolicitacoesLote
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
  authorizeSolicitacaoView,
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

solicitacoesRouter.post(
  "/solicitacoes/:id/invalidar-voucher",
  authenticateToken,
  validateRequest("body", invalidarVoucherSchema),
  postSolicitacaoInvalidarVoucher
);

solicitacoesRouter.post(
  "/solicitacoes/lote/separar",
  authenticateToken,
  canSeparate,
  validateRequest("body", separarSolicitacoesLoteSchema),
  postSolicitacoesLoteSeparar
);

export default solicitacoesRouter;
