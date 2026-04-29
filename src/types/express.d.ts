import { DecodedToken } from "../middleware/auth.middleware";
import { TipoRequisicao } from "../models/Solicitacao";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      isMasterAdmin?: boolean;
      isAdmin?: boolean;
      adminPermissions?: TipoRequisicao[];
      approvalPermissions?: TipoRequisicao[];
      canApproveTrade?: boolean;
      separationPermissions?: TipoRequisicao[];
      bipagemPermissions?: TipoRequisicao[];
      tradeApprovalPermissions?: TipoRequisicao[] | null;
      allowedSolicitacaoTypes?: TipoRequisicao[] | null;
    }
  }
}

export {};
