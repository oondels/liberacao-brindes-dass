import { Router } from "express";
import { getRetiradaPreview, postRetiradaBipar } from "../controllers/retirada.controller";
import { validateRequest } from "../middleware/validate";
import { biparVoucherSchema } from "../schemas/retirada.schema";

const retiradasRouter = Router();

retiradasRouter.get("/retiradas/:codigo_unico", getRetiradaPreview);
retiradasRouter.post("/retiradas/bipar", validateRequest("body", biparVoucherSchema), postRetiradaBipar);

export default retiradasRouter;
