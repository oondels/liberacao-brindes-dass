import { z } from "zod";

const tipoRequisicaoValues = [
  "teste_calce",
  "gratificacao",
  "brinde_interno",
  "pense_aja",
  "campanha",
  "falta_zero",
  "sandalia",
  "doacao",
] as const;

const tipoRequisicaoSeparacaoValues = [
  "brinde_interno",
  "pense_aja",
  "campanha",
  "falta_zero",
  "sandalia",
  "doacao",
] as const;

const subgrupoCampanhaValues = [
  "brigada_incendio",
  "eficiencia",
  "hora_extra",
  "brinde_5s",
] as const;

const generoValues = ["masculino", "feminino"] as const;

const optionalNonEmptyTrimmedString = (message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().min(1, message).optional()
  );

const numericString = z
  .string()
  .trim()
  .regex(/^\d+$/, "Deve conter apenas numeros");

export const createSolicitacaoSchema = z
  .object({
    nome: z.string().trim().min(1, "Nome obrigatorio"),
    matricula: numericString,
    setor: z.string().trim().min(1, "Setor obrigatorio"),
    gerente: z.string().trim().min(1, "Gerente obrigatorio"),
    tipo_requisicao: z.enum(tipoRequisicaoValues),
    subgrupo_campanha: z.enum(subgrupoCampanhaValues).optional(),
    genero: z.enum(generoValues),
    brinde_id: z.string().uuid("Brinde inválido").optional(),
    marca: optionalNonEmptyTrimmedString("Marca obrigatoria"),
    modelo: optionalNonEmptyTrimmedString("Modelo obrigatorio"),
    num_calce: numericString,
    categoria_infantil: z.boolean().optional().default(false),
    rfid: numericString.optional(),
    codbarras: numericString.optional(),
    bonificacao_user_liberacao: numericString.optional(),
  })
  .superRefine((data, ctx) => {
    const isCampanha = data.tipo_requisicao === "campanha";
    const isTesteCalce = data.tipo_requisicao === "teste_calce";

    if (isCampanha && !data.subgrupo_campanha) {
      ctx.addIssue({
        code: "custom",
        message: "Subgrupo de campanha obrigatório",
        path: ["subgrupo_campanha"],
      });
    }

    if (!isCampanha && data.subgrupo_campanha) {
      ctx.addIssue({
        code: "custom",
        message: "Subgrupo de campanha permitido apenas para tipo campanha",
        path: ["subgrupo_campanha"],
      });
    }

    if (isTesteCalce && !data.marca) {
      ctx.addIssue({
        code: "custom",
        message: "Marca obrigatoria",
        path: ["marca"],
      });
    }

    if (isTesteCalce && !data.modelo) {
      ctx.addIssue({
        code: "custom",
        message: "Modelo obrigatorio",
        path: ["modelo"],
      });
    }

    const isGratificacao = data.tipo_requisicao === "gratificacao";
    if (isGratificacao && !data.bonificacao_user_liberacao) {
      ctx.addIssue({
        code: "custom",
        message: "Matrícula de quem conferiu a bonificação é obrigatória para gratificação",
        path: ["bonificacao_user_liberacao"],
      });
    }
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

const optionalBodyInt = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
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
      "aguardando_separacao",
      "aguardando_troca",
      "aprovado",
      "rejeitado",
      "retirado",
      "cancelado",
      "invalidado",
    ]),
    gerente: optionalTrimmedString.optional(),
    setor: optionalTrimmedString.optional(),
    tipo_requisicao: optionalEnum([...tipoRequisicaoValues]),
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

export const aprovarSolicitacaoSchema = z
  .object({
    brinde_id: z.string().uuid("Brinde inválido").optional(),
    marca: optionalNonEmptyTrimmedString("Marca deve ser informada"),
    modelo: optionalNonEmptyTrimmedString("Modelo deve ser informado"),
    bonificacao_user_liberacao: optionalBodyInt.optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.marca && !data.modelo) || (!data.marca && data.modelo)) {
      ctx.addIssue({
        code: "custom",
        message: "Informe marca e modelo juntos para definir o brinde",
        path: data.marca ? ["modelo"] : ["marca"],
      });
    }
  });

export type AprovarSolicitacaoInput = z.infer<typeof aprovarSolicitacaoSchema>;

export const separarSolicitacaoSchema = z
  .object({
    brinde_id: z.string().uuid("Brinde inválido").optional(),
    marca: optionalNonEmptyTrimmedString("Marca deve ser informada"),
    modelo: optionalNonEmptyTrimmedString("Modelo deve ser informado"),
  });

export type SepararSolicitacaoInput = z.infer<typeof separarSolicitacaoSchema>;

export const separarSolicitacoesLoteSchema = z
  .object({
    ids: z.array(z.string().uuid("ID inválido")).min(1, "Deve enviar no mínimo 1 solicitação para separar"),
    brinde_id: z.string().uuid("Brinde inválido").optional(),
    marca: optionalNonEmptyTrimmedString("Marca deve ser informada"),
    modelo: optionalNonEmptyTrimmedString("Modelo deve ser informado"),
  });

export type SepararSolicitacoesLoteInput = z.infer<typeof separarSolicitacoesLoteSchema>;

export const gerarVouchersLoteSchema = z.object({
  ids: z.array(z.string().uuid("ID inválido")).min(1, "Deve selecionar pelo menos 1 solicitação para gerar vouchers"),
});

export type GerarVouchersLoteInput = z.infer<typeof gerarVouchersLoteSchema>;

export const listSolicitacaoSeparacaoQuerySchema = z.object({
  page: optionalPage.optional().default(1),
  tipo_requisicao: optionalEnum([...tipoRequisicaoSeparacaoValues]),
});

export type ListSolicitacaoSeparacaoQuery = z.infer<typeof listSolicitacaoSeparacaoQuerySchema>;

export const cancelSolicitacaoSchema = z.object({
  motivo: z.string().trim().min(1, "Motivo do cancelamento é obrigatório"),
});

export type CancelSolicitacaoInput = z.infer<typeof cancelSolicitacaoSchema>;

export const invalidarVoucherSchema = z.object({
  motivo: z.string().trim().min(1, "Justificativa da invalidação é obrigatória"),
});

export type InvalidarVoucherInput = z.infer<typeof invalidarVoucherSchema>;

export const createSolicitacaoLoteSchema = z.object({
  solicitacoes: z.array(createSolicitacaoSchema).min(1, "Deve enviar no mínimo 1 solicitação").max(200, "O lote pode ter no máximo 200 solicitações"),
});

export type CreateSolicitacaoLoteInput = z.infer<typeof createSolicitacaoLoteSchema>;
