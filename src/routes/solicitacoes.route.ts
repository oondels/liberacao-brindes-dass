import { Router } from "express";
import {
  getSolicitacaoById,
  getSolicitacoes,
  postSolicitacaoAprovar,
  postSolicitacaoCancelar,
  postSolicitacaoRejeitar,
  postSolicitacoes,
} from "../controllers/solicitacao.controller";
import { validateRequest } from "../middleware/validate";
import {
  cancelSolicitacaoSchema,
  createSolicitacaoSchema,
  listSolicitacaoQuerySchema,
} from "../schemas/solicitacao.schema";

const solicitacoesRouter = Router();

solicitacoesRouter.post(
  "/solicitacoes",
  validateRequest("body", createSolicitacaoSchema),
  postSolicitacoes
);

solicitacoesRouter.get(
  "/solicitacoes",
  validateRequest("query", listSolicitacaoQuerySchema),
  getSolicitacoes
);

solicitacoesRouter.get("/solicitacoes/:id", getSolicitacaoById);

solicitacoesRouter.post("/solicitacoes/:id/aprovar", postSolicitacaoAprovar);
solicitacoesRouter.post("/solicitacoes/:id/rejeitar", postSolicitacaoRejeitar);
solicitacoesRouter.post(
  "/solicitacoes/:id/cancelar",
  validateRequest("body", cancelSolicitacaoSchema),
  postSolicitacaoCancelar
);

export default solicitacoesRouter;
