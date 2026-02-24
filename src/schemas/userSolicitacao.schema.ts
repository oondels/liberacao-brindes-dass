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

export const createUserSolicitacaoSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  matricula: z.number().int("Matrícula deve ser um inteiro"),
  rfid: z.number().int("RFID deve ser um inteiro").optional(),
  codbarras: z.number().int("Código de barras deve ser um inteiro").optional(),
  tipo_requisicao: z
    .array(z.nativeEnum(TipoRequisicao))
    .min(1, "Ao menos um tipo de requisição é obrigatório"),
});

export type CreateUserSolicitacaoInput = z.infer<typeof createUserSolicitacaoSchema>;

export const putUserSolicitacaoSchema = createUserSolicitacaoSchema;

export type PutUserSolicitacaoInput = z.infer<typeof putUserSolicitacaoSchema>;

export const userSolicitacaoIdParamSchema = z.object({
  id: z.string().uuid("Id inválido"),
});

export type UserSolicitacaoIdParam = z.infer<typeof userSolicitacaoIdParamSchema>;

export const listUserSolicitacaoQuerySchema = z.object({
  matricula: optionalQueryInt.optional(),
  tipo_requisicao: z.nativeEnum(TipoRequisicao).optional(),
});

export type ListUserSolicitacaoQueryInput = z.infer<typeof listUserSolicitacaoQuerySchema>;
