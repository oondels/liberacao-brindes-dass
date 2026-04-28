import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import {
  createUserAprovacaoSchema,
  patchUserAprovacaoSchema,
} from "../schemas/userAprovacao.schema";
import {
  postUserAprovacao,
  getUserAprovacao,
  getUserAprovacaoById,
  patchUserAprovacao,
} from "../controllers/userAprovacao.controller";
import {
  deleteUserSeparacao,
  getUserSeparacao,
  getUserSeparacaoById,
  postUserSeparacao,
  putUserSeparacao,
} from "../controllers/userSeparacao.controller";
import {
  createUserSeparacaoSchema,
  listUserSeparacaoQuerySchema,
  putUserSeparacaoSchema,
  userSeparacaoIdParamSchema,
} from "../schemas/userSeparacao.schema";
import {
  brindeAtivoIdParamSchema,
  createBrindeAtivoSchema,
  listBrindeAtivoQuerySchema,
  putBrindeAtivoSchema,
} from "../schemas/brindeAtivo.schema";
import {
  deleteBrindeAtivo,
  getBrindeAtivoById,
  getBrindesAtivos,
  postBrindeAtivo,
  putBrindeAtivo,
} from "../controllers/brindeAtivo.controller";
import {
  deleteUserBipagem,
  getUserBipagem,
  getUserBipagemById,
  postUserBipagem,
  putUserBipagem,
} from "../controllers/userBipagem.controller";
import {
  createUserBipagemSchema,
  listUserBipagemQuerySchema,
  putUserBipagemSchema,
  userBipagemIdParamSchema,
} from "../schemas/userBipagem.schema";

const adminRouter = Router();

adminRouter.post(
  "/user-aprovacao",
  authenticateToken,
  validateRequest("body", createUserAprovacaoSchema),
  postUserAprovacao
);

adminRouter.get("/user-aprovacao", authenticateToken, getUserAprovacao);

adminRouter.get("/user-aprovacao/:id", authenticateToken, getUserAprovacaoById);

adminRouter.patch(
  "/user-aprovacao/:id",
  authenticateToken,
  validateRequest("body", patchUserAprovacaoSchema),
  patchUserAprovacao
);

adminRouter.post(
  "/user-separacao",
  authenticateToken,
  validateRequest("body", createUserSeparacaoSchema),
  postUserSeparacao
);

adminRouter.get(
  "/user-separacao",
  authenticateToken,
  validateRequest("query", listUserSeparacaoQuerySchema),
  getUserSeparacao
);

adminRouter.get(
  "/user-separacao/:id",
  authenticateToken,
  validateRequest("params", userSeparacaoIdParamSchema),
  getUserSeparacaoById
);

adminRouter.put(
  "/user-separacao/:id",
  authenticateToken,
  validateRequest("params", userSeparacaoIdParamSchema),
  validateRequest("body", putUserSeparacaoSchema),
  putUserSeparacao
);

adminRouter.delete(
  "/user-separacao/:id",
  authenticateToken,
  validateRequest("params", userSeparacaoIdParamSchema),
  deleteUserSeparacao
);

adminRouter.post(
  "/user-bipagem",
  authenticateToken,
  validateRequest("body", createUserBipagemSchema),
  postUserBipagem
);

adminRouter.get(
  "/user-bipagem",
  authenticateToken,
  validateRequest("query", listUserBipagemQuerySchema),
  getUserBipagem
);

adminRouter.get(
  "/user-bipagem/:id",
  authenticateToken,
  validateRequest("params", userBipagemIdParamSchema),
  getUserBipagemById
);

adminRouter.put(
  "/user-bipagem/:id",
  authenticateToken,
  validateRequest("params", userBipagemIdParamSchema),
  validateRequest("body", putUserBipagemSchema),
  putUserBipagem
);

adminRouter.delete(
  "/user-bipagem/:id",
  authenticateToken,
  validateRequest("params", userBipagemIdParamSchema),
  deleteUserBipagem
);

adminRouter.post(
  "/brindes",
  authenticateToken,
  validateRequest("body", createBrindeAtivoSchema),
  postBrindeAtivo
);

adminRouter.get(
  "/brindes",
  authenticateToken,
  validateRequest("query", listBrindeAtivoQuerySchema),
  getBrindesAtivos
);

adminRouter.get(
  "/brindes/:id",
  authenticateToken,
  validateRequest("params", brindeAtivoIdParamSchema),
  getBrindeAtivoById
);

adminRouter.put(
  "/brindes/:id",
  authenticateToken,
  validateRequest("params", brindeAtivoIdParamSchema),
  validateRequest("body", putBrindeAtivoSchema),
  putBrindeAtivo
);

adminRouter.delete(
  "/brindes/:id",
  authenticateToken,
  validateRequest("params", brindeAtivoIdParamSchema),
  deleteBrindeAtivo
);

export default adminRouter;
