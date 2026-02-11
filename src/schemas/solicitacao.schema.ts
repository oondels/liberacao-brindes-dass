import { z } from "zod";

const numericString = z
  .string()
  .trim()
  .regex(/^\d+$/, "Deve conter apenas numeros");

export const createSolicitacaoSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatorio"),
  matricula: numericString,
  setor: z.string().trim().min(1, "Setor obrigatorio"),
  gerente: z.string().trim().min(1, "Gerente obrigatorio"),
  tipo_requisicao: z.enum(["teste_calce", "producao", "sobra"]),
  marca: z.string().trim().min(1, "Marca obrigatoria"),
  modelo: z.string().trim().min(1, "Modelo obrigatorio"),
  num_calce: numericString,
  rfid: numericString.optional(),
  codbarras: numericString.optional(),
});

export type CreateSolicitacaoInput = z.infer<typeof createSolicitacaoSchema>;
