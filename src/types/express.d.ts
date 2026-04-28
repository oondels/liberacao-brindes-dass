import { DecodedToken } from "../middleware/auth.middleware";
import { TipoRequisicao } from "../models/Solicitacao";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      separationPermissions?: TipoRequisicao[];
    }
  }
}

export {};
