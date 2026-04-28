import { Router } from "express";
import { getRetiradaPreview, postRetiradaBipar } from "../controllers/retirada.controller";
import { validateRequest } from "../middleware/validate.middleware";
import { biparVoucherSchema } from "../schemas/retirada.schema";
import { authenticateToken } from "../middleware/auth.middleware";
import { canBiparRetirada } from "../middleware/canBiparRetirada.middleware";

const retiradasRouter = Router();

retiradasRouter.get("/retiradas", authenticateToken, getRetiradaPreview);
retiradasRouter.post("/retiradas/bipar", authenticateToken, canBiparRetirada, validateRequest("body", biparVoucherSchema), postRetiradaBipar);

export default retiradasRouter;
