import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import {
  getAdminDashboardAnalytics,
  getAdminDashboardExportSolicitacoes,
  getAdminDashboardRecentActivity,
  getAdminDashboardSummary,
} from "../controllers/dashboard.controller";
import {
  dashboardExportQuerySchema,
  dashboardRecentActivityQuerySchema,
} from "../schemas/dashboard.schema";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard/summary", authenticateToken, getAdminDashboardSummary);

dashboardRouter.get("/dashboard/analytics", authenticateToken, getAdminDashboardAnalytics);

dashboardRouter.get(
  "/dashboard/export-solicitacoes",
  authenticateToken,
  validateRequest("query", dashboardExportQuerySchema),
  getAdminDashboardExportSolicitacoes
);

dashboardRouter.get(
  "/dashboard/recent-activity",
  authenticateToken,
  validateRequest("query", dashboardRecentActivityQuerySchema),
  getAdminDashboardRecentActivity
);

export default dashboardRouter;
