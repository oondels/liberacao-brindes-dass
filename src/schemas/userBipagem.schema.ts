import { z } from "zod";
import { TipoRequisicao } from "../models/Solicitacao";

const optionalQueryInt = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? value : parsed;
  },
  z.number().int().nonnegative()
);

const tipoRequisicaoBipagemSchema = z
  .array(z.nativeEnum(TipoRequisicao))
  .min(1, "Ao menos um tipo de requisição é obrigatório");

export const createUserBipagemSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  matricula: z.number().int("Matrícula deve ser um inteiro"),
  rfid: z.number().int("RFID deve ser um inteiro").optional(),
  codbarras: z.number().int("Código de barras deve ser um inteiro").optional(),
  tipo_requisicao: tipoRequisicaoBipagemSchema.optional(),
});

export type CreateUserBipagemInput = z.infer<typeof createUserBipagemSchema>;

export const putUserBipagemSchema = createUserBipagemSchema;

export type PutUserBipagemInput = z.infer<typeof putUserBipagemSchema>;

export const userBipagemIdParamSchema = z.object({
  id: z.string().uuid("Id inválido"),
});

export type UserBipagemIdParam = z.infer<typeof userBipagemIdParamSchema>;

export const listUserBipagemQuerySchema = z.object({
  matricula: optionalQueryInt.optional(),
  tipo_requisicao: z.nativeEnum(TipoRequisicao).optional(),
});

export type ListUserBipagemQueryInput = z.infer<typeof listUserBipagemQuerySchema>;
