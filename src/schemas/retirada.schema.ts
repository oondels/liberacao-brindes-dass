import { z } from "zod";

export const biparVoucherSchema = z.object({
  codigo_voucher: z.string().trim().min(1, "Código do voucher é obrigatório")
});

export type BiparVoucherInput = z.infer<typeof biparVoucherSchema>;
