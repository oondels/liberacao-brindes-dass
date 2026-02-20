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
  tipo_requisicao: z.enum(["teste_calce", "producao", "sobra", "pense_aja", "campanha", "falta_zero"]),
  marca: z.string().trim().min(1, "Marca obrigatoria"),
  modelo: z.string().trim().min(1, "Modelo obrigatorio"),
  num_calce: numericString,
  rfid: numericString.optional(),
  codbarras: numericString.optional(),
});

export type CreateSolicitacaoInput = z.infer<typeof createSolicitacaoSchema>;

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string()
);

const optionalInt = z.preprocess(
  (value) => {
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

const optionalDate = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }

    return new Date(trimmed);
  },
  z.date()
);

const optionalEnum = (values: [string, ...string[]]) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.enum(values).optional()
  );

const optionalPage = z.preprocess(
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
  z.number().int().min(1)
);

export const listSolicitacaoQuerySchema = z
  .object({
    data_inicial: optionalDate.optional(),
    data_final: optionalDate.optional(),
    status: optionalEnum([
      "pendente_aprovacao",
      "aprovado",
      "rejeitado",
      "retirado",
      "cancelado",
    ]),
    gerente: optionalTrimmedString.optional(),
    setor: optionalTrimmedString.optional(),
    tipo_requisicao: optionalEnum(["teste_calce", "producao", "sobra", "pense_aja", "campanha", "falta_zero"]),
    matricula: optionalInt.optional(),
    rfid: optionalInt.optional(),
    codbarras: optionalInt.optional(),
    page: optionalPage.optional().default(1),
  })
  .refine(
    (data) => {
      if (!data.data_inicial || !data.data_final) {
        return true;
      }

      return data.data_inicial <= data.data_final;
    },
    {
      message: "data_final deve ser maior ou igual a data_inicial",
      path: ["data_final"],
    }
  );

export type ListSolicitacaoQuery = z.infer<typeof listSolicitacaoQuerySchema>;

export const cancelSolicitacaoSchema = z.object({
  motivo: z.string().trim().min(1, "Motivo do cancelamento é obrigatório"),
});

export type CancelSolicitacaoInput = z.infer<typeof cancelSolicitacaoSchema>;
