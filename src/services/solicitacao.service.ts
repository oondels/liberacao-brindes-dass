import { ServiceResult } from "../types/service";

export type SolicitacaoResponse = {
  error: string;
};

const notImplemented = (): ServiceResult<SolicitacaoResponse> => ({
  status: 501,
  body: { error: "not implemented" },
});

export const criarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const listarSolicitacoes = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const obterSolicitacaoPorId = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const aprovarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const rejeitarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const cancelarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();
