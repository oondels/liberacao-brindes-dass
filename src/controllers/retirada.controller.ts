import { Request, Response } from "express";
import { biparRetirada, previewRetirada, solicitarTroca } from "../services/retirada.service";
import { TipoRequisicao } from "../models/Solicitacao";
import { BiparVoucherInput } from "../schemas/retirada.schema";

export const getRetiradaPreview = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const result = "Teste de endpoint de retirada - preview (não implementado)";
  const user = _req.user; // Acessa os dados do usuário autenticado
  res.status(200).json({ result, user });
};

export const postRetiradaBipar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body;
  const user = req.user;

  const inputData = {
    codigo_voucher: body.codigo_voucher,
    matricula: user ? user.matricula : undefined,
    tipos_permitidos: req.bipagemPermissions,
  }
  const result = await biparRetirada(inputData as BiparVoucherInput & { matricula?: number; tipos_permitidos?: TipoRequisicao[] });
  res.status(result.status).json(result.body);
};

export const postRetiradaSolicitarTroca = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body;
  const user = req.user;

  const inputData = {
    codigo_voucher: body.codigo_voucher,
    matricula: user ? user.matricula : undefined,
    tipos_permitidos: req.bipagemPermissions,
  };

  const result = await solicitarTroca(
    inputData as BiparVoucherInput & { matricula?: number; tipos_permitidos?: TipoRequisicao[] }
  );
  res.status(result.status).json(result.body);
};
