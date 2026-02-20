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

export default adminRouter;
