import { z } from "zod";
import { TipoRequisicao } from "../models/Solicitacao";

const tiposSeparacaoPermitidos = Object.values(TipoRequisicao).filter(
  (tipo) => tipo !== TipoRequisicao.TESTE_CALCE
) as [TipoRequisicao, ...TipoRequisicao[]];

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

const tipoRequisicaoSeparacaoSchema = z
  .array(z.enum(tiposSeparacaoPermitidos))
  .min(1, "Ao menos um tipo de requisição é obrigatório");

export const createUserSeparacaoSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  matricula: z.number().int("Matrícula deve ser um inteiro"),
  rfid: z.number().int("RFID deve ser um inteiro").optional(),
  codbarras: z.number().int("Código de barras deve ser um inteiro").optional(),
  tipo_requisicao: tipoRequisicaoSeparacaoSchema.optional(),
});

export type CreateUserSeparacaoInput = z.infer<typeof createUserSeparacaoSchema>;

export const putUserSeparacaoSchema = createUserSeparacaoSchema;

export type PutUserSeparacaoInput = z.infer<typeof putUserSeparacaoSchema>;

export const patchUserSeparacaoSchema = createUserSeparacaoSchema.partial();

export type PatchUserSeparacaoInput = z.infer<typeof patchUserSeparacaoSchema>;

export const userSeparacaoIdParamSchema = z.object({
  id: z.string().uuid("Id inválido"),
});

export type UserSeparacaoIdParam = z.infer<typeof userSeparacaoIdParamSchema>;

export const listUserSeparacaoQuerySchema = z.object({
  matricula: optionalQueryInt.optional(),
  tipo_requisicao: z.enum(tiposSeparacaoPermitidos).optional(),
});

export type ListUserSeparacaoQueryInput = z.infer<typeof listUserSeparacaoQuerySchema>;
