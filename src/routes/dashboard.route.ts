import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeDashboardView } from "../middleware/authorization.middleware";
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

dashboardRouter.use(authenticateToken, authorizeDashboardView);

dashboardRouter.get("/dashboard/summary", getAdminDashboardSummary);

dashboardRouter.get("/dashboard/analytics", getAdminDashboardAnalytics);

dashboardRouter.get(
  "/dashboard/export-solicitacoes",
  validateRequest("query", dashboardExportQuerySchema),
  getAdminDashboardExportSolicitacoes
);

dashboardRouter.get(
  "/dashboard/recent-activity",
  validateRequest("query", dashboardRecentActivityQuerySchema),
  getAdminDashboardRecentActivity
);

export default dashboardRouter;
