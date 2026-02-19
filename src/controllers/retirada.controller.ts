import { Request, Response } from "express";
import { biparRetirada, previewRetirada } from "../services/retirada.service";
import { BiparVoucherInput } from "../schemas/retirada.schema";

export const getRetiradaPreview = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const result = await previewRetirada();
  res.status(result.status).json(result.body);
};

export const postRetiradaBipar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body as BiparVoucherInput;
  const result = await biparRetirada(body);
  res.status(result.status).json(result.body);
};
