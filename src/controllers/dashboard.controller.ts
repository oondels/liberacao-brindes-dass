import { NextFunction, Request, Response } from "express";
import {
  DashboardExportQueryInput,
  DashboardRecentActivityQueryInput,
} from "../schemas/dashboard.schema";
import {
  getDashboardAnalytics,
  getDashboardExportSolicitacoes,
  getDashboardRecentActivity,
  getDashboardSummary,
} from "../services/dashboard.service";

export const getAdminDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getDashboardSummary({
      isMasterAdmin: req.isMasterAdmin ?? false,
      allowedTypes: req.dashboardPermissions ?? null,
    });
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getDashboardAnalytics({
      isMasterAdmin: req.isMasterAdmin ?? false,
      allowedTypes: req.dashboardPermissions ?? null,
    });
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getDashboardRecentActivity(
      req.query as unknown as DashboardRecentActivityQueryInput,
      {
        isMasterAdmin: req.isMasterAdmin ?? false,
        allowedTypes: req.dashboardPermissions ?? null,
      }
    );
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardExportSolicitacoes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getDashboardExportSolicitacoes(
      req.query as unknown as DashboardExportQueryInput,
      {
        isMasterAdmin: req.isMasterAdmin ?? false,
        allowedTypes: req.dashboardPermissions ?? null,
      }
    );
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
