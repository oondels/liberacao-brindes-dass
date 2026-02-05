import { Router } from "express";
import {
  getSolicitacaoById,
  getSolicitacoes,
  postSolicitacaoAprovar,
  postSolicitacaoCancelar,
  postSolicitacaoRejeitar,
  postSolicitacoes,
} from "../controllers/solicitacao.controller";

const solicitacoesRouter = Router();

solicitacoesRouter.post("/solicitacoes", postSolicitacoes);
solicitacoesRouter.get("/solicitacoes", getSolicitacoes);
solicitacoesRouter.get("/solicitacoes/:id", getSolicitacaoById);
solicitacoesRouter.post("/solicitacoes/:id/aprovar", postSolicitacaoAprovar);
solicitacoesRouter.post("/solicitacoes/:id/rejeitar", postSolicitacaoRejeitar);
solicitacoesRouter.post("/solicitacoes/:id/cancelar", postSolicitacaoCancelar);

export default solicitacoesRouter;
