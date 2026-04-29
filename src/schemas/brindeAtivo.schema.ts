import { z } from "zod";
import { GeneroSolicitacao, SubgrupoCampanha, TipoRequisicao } from "../models/Solicitacao";

const optionalTrimmedString = (message: string) =>
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
  z.number().int().min(10).max(60)
);

const optionalBooleanQuery = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === "") {
        return undefined;
      }

      if (trimmed === "true") {
        return true;
      }

      if (trimmed === "false") {
        return false;
      }
    }

    return value;
  },
  z.boolean()
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

export const createBrindeAtivoSchema = z
  .object({
    nome: z.string().trim().min(1, "Nome obrigatório"),
    tipo_requisicao: z.nativeEnum(TipoRequisicao),
    subgrupo_campanha: z.nativeEnum(SubgrupoCampanha).optional(),
    marca: optionalTrimmedString("Marca inválida"),
    modelo: optionalTrimmedString("Modelo inválido"),
    genero: z.nativeEnum(GeneroSolicitacao).optional(),
    num_calce: z.number().int().min(10).max(60).optional(),
    ativo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const isCampanha = data.tipo_requisicao === TipoRequisicao.CAMPANHA;

    if (isCampanha && !data.subgrupo_campanha) {
      ctx.addIssue({
        code: "custom",
        message: "Subgrupo de campanha obrigatório para tipo campanha",
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
  });

export type CreateBrindeAtivoInput = z.infer<typeof createBrindeAtivoSchema>;

export const putBrindeAtivoSchema = createBrindeAtivoSchema;

export type PutBrindeAtivoInput = z.infer<typeof putBrindeAtivoSchema>;

export const brindeAtivoIdParamSchema = z.object({
  id: z.string().uuid("Id inválido"),
});

export type BrindeAtivoIdParam = z.infer<typeof brindeAtivoIdParamSchema>;

export const listBrindeAtivoQuerySchema = z.object({
  tipo_requisicao: z.nativeEnum(TipoRequisicao).optional(),
  subgrupo_campanha: z.nativeEnum(SubgrupoCampanha).optional(),
  genero: z.nativeEnum(GeneroSolicitacao).optional(),
  ativo: optionalBooleanQuery.optional(),
  num_calce: optionalQueryInt.optional(),
  page: optionalPage.optional().default(1),
});

export type ListBrindeAtivoQueryInput = z.infer<typeof listBrindeAtivoQuerySchema>;
