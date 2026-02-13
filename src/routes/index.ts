import { Router } from "express";
import retiradasRouter from "./retiradas.route";
import solicitacoesRouter from "./solicitacoes.route";

const apiRouter = Router();

apiRouter.use(solicitacoesRouter);
apiRouter.use(retiradasRouter);

export default apiRouter;
