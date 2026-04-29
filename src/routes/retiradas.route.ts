import { Router } from "express";
import {
  getRetiradaVoucherByCodigo,
  getRetiradaPreview,
  postRetiradaBipar,
  postRetiradaSolicitarTroca,
} from "../controllers/retirada.controller";
import { validateRequest } from "../middleware/validate.middleware";
import { biparVoucherSchema, getVoucherRetiradaParamsSchema } from "../schemas/retirada.schema";
import { authenticateToken } from "../middleware/auth.middleware";
import { canBiparRetirada } from "../middleware/canBiparRetirada.middleware";

const retiradasRouter = Router();

retiradasRouter.get("/retiradas", authenticateToken, getRetiradaPreview);
retiradasRouter.get(
  "/retiradas/voucher/:codigo",
  authenticateToken,
  canBiparRetirada,
  validateRequest("params", getVoucherRetiradaParamsSchema),
  getRetiradaVoucherByCodigo
);
retiradasRouter.post("/retiradas/bipar", authenticateToken, canBiparRetirada, validateRequest("body", biparVoucherSchema), postRetiradaBipar);
retiradasRouter.post(
  "/retiradas/solicitar-troca",
  authenticateToken,
  canBiparRetirada,
  validateRequest("body", biparVoucherSchema),
  postRetiradaSolicitarTroca
);

export default retiradasRouter;
