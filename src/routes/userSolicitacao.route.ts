import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import {
  createUserSolicitacaoSchema,
  listUserSolicitacaoQuerySchema,
  putUserSolicitacaoSchema,
  userSolicitacaoIdParamSchema,
} from "../schemas/userSolicitacao.schema";
import {
  deleteUserSolicitacao,
  getUserSolicitacao,
  getUserSolicitacaoById,
  postUserSolicitacao,
  putUserSolicitacao,
} from "../controllers/userSolicitacao.controller";

const userSolicitacaoRouter = Router();

userSolicitacaoRouter.use(authenticateToken);

userSolicitacaoRouter.post(
  "/user-solicitacao",
  validateRequest("body", createUserSolicitacaoSchema),
  postUserSolicitacao
);

userSolicitacaoRouter.get(
  "/user-solicitacao",
  validateRequest("query", listUserSolicitacaoQuerySchema),
  getUserSolicitacao
);

userSolicitacaoRouter.get(
  "/user-solicitacao/:id",
  validateRequest("params", userSolicitacaoIdParamSchema),
  getUserSolicitacaoById
);

userSolicitacaoRouter.put(
  "/user-solicitacao/:id",
  validateRequest("params", userSolicitacaoIdParamSchema),
  validateRequest("body", putUserSolicitacaoSchema),
  putUserSolicitacao
);

userSolicitacaoRouter.delete(
  "/user-solicitacao/:id",
  validateRequest("params", userSolicitacaoIdParamSchema),
  deleteUserSolicitacao
);

export default userSolicitacaoRouter;
