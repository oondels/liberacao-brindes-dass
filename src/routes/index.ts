import { Router } from "express";
import retiradasRouter from "./retiradas.route";
import solicitacoesRouter from "./solicitacoes.route";
import adminRouter from "./admin.route";
import userSolicitacaoRouter from "./userSolicitacao.route";
import dashboardRouter from "./dashboard.route";
import docsRouter from "./docs.route";
import userPermissoesRouter from "./userPermissoes.route";

const apiRouter = Router();

apiRouter.use(docsRouter);
apiRouter.use(solicitacoesRouter);
apiRouter.use(retiradasRouter);
apiRouter.use(userPermissoesRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/admin", dashboardRouter);
apiRouter.use(userSolicitacaoRouter);

export default apiRouter;
