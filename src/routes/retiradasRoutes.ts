import { Router } from "express";
import { getRetiradaPreview, postRetiradaBipar } from "../controllers/retirada.controller";

const retiradasRouter = Router();

retiradasRouter.get("/retiradas/:codigo_unico", getRetiradaPreview);
retiradasRouter.post("/retiradas/bipar", postRetiradaBipar);

export default retiradasRouter;
