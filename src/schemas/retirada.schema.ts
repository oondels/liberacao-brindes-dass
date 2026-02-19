import { z } from "zod";

export const biparVoucherSchema = z.object({
  codigo_voucher: z.string().trim().min(1, "Código do voucher é obrigatório"),
  matricula: z
    .number({ error: "Matrícula deve ser um número" })
    .int("Matrícula deve ser um número inteiro")
    .positive("Matrícula deve ser positiva"),
});

export type BiparVoucherInput = z.infer<typeof biparVoucherSchema>;
