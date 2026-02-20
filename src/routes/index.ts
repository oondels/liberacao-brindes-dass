import { Router } from "express";
import retiradasRouter from "./retiradas.route";
import solicitacoesRouter from "./solicitacoes.route";
import adminRouter from "./admin.route";

const apiRouter = Router();

apiRouter.use(solicitacoesRouter);
apiRouter.use(retiradasRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
