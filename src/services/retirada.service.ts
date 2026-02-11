import { ServiceResult } from "../types/service";

export type RetiradaResponse = {
  error: string;
};

const notImplemented = (): ServiceResult<RetiradaResponse> => ({
  status: 501,
  body: { error: "not implemented" },
});

export const previewRetirada = async (): Promise<ServiceResult<RetiradaResponse>> =>
  notImplemented();

export const biparRetirada = async (): Promise<ServiceResult<RetiradaResponse>> =>
  notImplemented();
