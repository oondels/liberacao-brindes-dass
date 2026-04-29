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

const tipoRequisicaoAdminSchema = z
  .array(z.nativeEnum(TipoRequisicao))
  .min(1, "Ao menos um tipo de requisição é obrigatório");

export const createUserAdminSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  matricula: z.number().int("Matrícula deve ser um inteiro"),
  tipo_requisicao: tipoRequisicaoAdminSchema,
});

export type CreateUserAdminInput = z.infer<typeof createUserAdminSchema>;

export const putUserAdminSchema = createUserAdminSchema;

export type PutUserAdminInput = z.infer<typeof putUserAdminSchema>;

export const userAdminIdParamSchema = z.object({
  id: z.string().uuid("Id inválido"),
});

export type UserAdminIdParam = z.infer<typeof userAdminIdParamSchema>;

export const listUserAdminQuerySchema = z.object({
  matricula: optionalQueryInt.optional(),
  tipo_requisicao: z.nativeEnum(TipoRequisicao).optional(),
});

export type ListUserAdminQueryInput = z.infer<typeof listUserAdminQuerySchema>;
