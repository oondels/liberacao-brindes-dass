import { z } from "zod";
import { TipoRequisicao } from "../models/Solicitacao";

export const createUserAprovacaoSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  matricula: z.number().int("Matrícula deve ser um inteiro"),
  rfid: z.number().int("RFID deve ser um inteiro").optional(),
  codbarras: z.number().int("Código de barras deve ser um inteiro").optional(),
  tipo_requisicao: z
    .array(z.nativeEnum(TipoRequisicao))
    .min(1, "Ao menos um tipo de requisição é obrigatório")
    .nullable()
    .optional(),
  pode_aprovar_troca: z.boolean().optional(),
});

export type CreateUserAprovacaoInput = z.infer<typeof createUserAprovacaoSchema>;

export const patchUserAprovacaoSchema = createUserAprovacaoSchema.partial();

export type PatchUserAprovacaoInput = z.infer<typeof patchUserAprovacaoSchema>;
