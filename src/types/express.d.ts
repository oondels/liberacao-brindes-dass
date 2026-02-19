import { DecodedToken } from "../middleware/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export {};