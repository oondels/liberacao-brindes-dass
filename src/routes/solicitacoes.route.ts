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

// Protegida para somente modelagem e gerentes e portaria
solicitacoesRouter.get(
  "/solicitacoes",
  validateRequest("query", listSolicitacaoQuerySchema),
  getSolicitacoes
);

// Colocar rota protegida por autenticação quando implementada para somente gerente e portaria
solicitacoesRouter.get("/solicitacoes/:id", getSolicitacaoById);

solicitacoesRouter.post("/solicitacoes/:id/aprovar", postSolicitacaoAprovar);
solicitacoesRouter.post("/solicitacoes/:id/rejeitar", postSolicitacaoRejeitar);
solicitacoesRouter.post(
  "/solicitacoes/:id/cancelar",
  validateRequest("body", cancelSolicitacaoSchema),
  postSolicitacaoCancelar
);

export default solicitacoesRouter;
