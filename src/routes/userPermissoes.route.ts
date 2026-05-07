import { Router } from "express";
import { getUserPermissoes } from "../controllers/userPermissoes.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const userPermissoesRouter = Router();

userPermissoesRouter.get("/user/permissoes", authenticateToken, getUserPermissoes);

export default userPermissoesRouter;
