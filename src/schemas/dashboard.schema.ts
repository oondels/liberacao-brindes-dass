import { z } from "zod";

const queryInt = (min: number, max: number) =>
  z.preprocess(
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
    z.number().int().min(min).max(max)
  );

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const dashboardRecentActivityQuerySchema = z.object({
  page: queryInt(1, 100000).optional().default(1),
  limit: queryInt(1, 100).optional().default(10),
});

export type DashboardRecentActivityQueryInput = z.infer<typeof dashboardRecentActivityQuerySchema>;

export const dashboardExportQuerySchema = z
  .object({
    data_inicial: z
      .string()
      .trim()
      .regex(dateOnlyRegex, "data_inicial deve estar no formato YYYY-MM-DD"),
    data_final: z
      .string()
      .trim()
      .regex(dateOnlyRegex, "data_final deve estar no formato YYYY-MM-DD"),
  })
  .refine((data) => data.data_inicial <= data.data_final, {
    message: "data_final deve ser maior ou igual a data_inicial",
    path: ["data_final"],
  });

export type DashboardExportQueryInput = z.infer<typeof dashboardExportQuerySchema>;
