import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { isAdmin, isMasterAdmin } from "../middleware/authorization.middleware";
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
import {
  createUserAdminSchema,
  listUserAdminQuerySchema,
  putUserAdminSchema,
  userAdminIdParamSchema,
} from "../schemas/userAdmin.schema";
import {
  deleteUserAdmin,
  getUserAdmin,
  getUserAdminById,
  postUserAdmin,
  putUserAdmin,
} from "../controllers/userAdmin.controller";

const adminRouter = Router();

adminRouter.use(authenticateToken, isAdmin);

adminRouter.post(
  "/user-aprovacao",
  validateRequest("body", createUserAprovacaoSchema),
  postUserAprovacao
);

adminRouter.get("/user-aprovacao", getUserAprovacao);

adminRouter.get("/user-aprovacao/:id", getUserAprovacaoById);

adminRouter.patch(
  "/user-aprovacao/:id",
  validateRequest("body", patchUserAprovacaoSchema),
  patchUserAprovacao
);

adminRouter.post(
  "/user-separacao",
  validateRequest("body", createUserSeparacaoSchema),
  postUserSeparacao
);

adminRouter.get(
  "/user-separacao",
  validateRequest("query", listUserSeparacaoQuerySchema),
  getUserSeparacao
);

adminRouter.get(
  "/user-separacao/:id",
  validateRequest("params", userSeparacaoIdParamSchema),
  getUserSeparacaoById
);

adminRouter.put(
  "/user-separacao/:id",
  validateRequest("params", userSeparacaoIdParamSchema),
  validateRequest("body", putUserSeparacaoSchema),
  putUserSeparacao
);

adminRouter.delete(
  "/user-separacao/:id",
  validateRequest("params", userSeparacaoIdParamSchema),
  deleteUserSeparacao
);

adminRouter.post(
  "/user-bipagem",
  validateRequest("body", createUserBipagemSchema),
  postUserBipagem
);

adminRouter.get(
  "/user-bipagem",
  validateRequest("query", listUserBipagemQuerySchema),
  getUserBipagem
);

adminRouter.get(
  "/user-bipagem/:id",
  validateRequest("params", userBipagemIdParamSchema),
  getUserBipagemById
);

adminRouter.put(
  "/user-bipagem/:id",
  validateRequest("params", userBipagemIdParamSchema),
  validateRequest("body", putUserBipagemSchema),
  putUserBipagem
);

adminRouter.delete(
  "/user-bipagem/:id",
  validateRequest("params", userBipagemIdParamSchema),
  deleteUserBipagem
);

adminRouter.post(
  "/brindes",
  validateRequest("body", createBrindeAtivoSchema),
  postBrindeAtivo
);

adminRouter.get(
  "/brindes",
  validateRequest("query", listBrindeAtivoQuerySchema),
  getBrindesAtivos
);

adminRouter.get(
  "/brindes/:id",
  validateRequest("params", brindeAtivoIdParamSchema),
  getBrindeAtivoById
);

adminRouter.put(
  "/brindes/:id",
  validateRequest("params", brindeAtivoIdParamSchema),
  validateRequest("body", putBrindeAtivoSchema),
  putBrindeAtivo
);

adminRouter.delete(
  "/brindes/:id",
  validateRequest("params", brindeAtivoIdParamSchema),
  deleteBrindeAtivo
);

adminRouter.post(
  "/user-admin",
  isMasterAdmin,
  validateRequest("body", createUserAdminSchema),
  postUserAdmin
);

adminRouter.get(
  "/user-admin",
  isMasterAdmin,
  validateRequest("query", listUserAdminQuerySchema),
  getUserAdmin
);

adminRouter.get(
  "/user-admin/:id",
  isMasterAdmin,
  validateRequest("params", userAdminIdParamSchema),
  getUserAdminById
);

adminRouter.put(
  "/user-admin/:id",
  isMasterAdmin,
  validateRequest("params", userAdminIdParamSchema),
  validateRequest("body", putUserAdminSchema),
  putUserAdmin
);

adminRouter.delete(
  "/user-admin/:id",
  isMasterAdmin,
  validateRequest("params", userAdminIdParamSchema),
  deleteUserAdmin
);

export default adminRouter;
