import { Request, Response } from "express";
import { biparRetirada, previewRetirada } from "../services/retiradaService";

export const getRetiradaPreview = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const result = await previewRetirada();
  res.status(result.status).json(result.body);
};

export const postRetiradaBipar = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const result = await biparRetirada();
  res.status(result.status).json(result.body);
};
