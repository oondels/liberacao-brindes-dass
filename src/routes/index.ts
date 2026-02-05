import { Router } from "express";
import retiradasRouter from "./retiradasRoutes";
import solicitacoesRouter from "./solicitacoesRoutes";

const apiRouter = Router();

apiRouter.use(solicitacoesRouter);
apiRouter.use(retiradasRouter);

export default apiRouter;
