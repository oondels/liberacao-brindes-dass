import { Router } from "express";
import { openApiSpec, renderSwaggerHtml } from "../docs/openapi";

const docsRouter = Router();

docsRouter.get("/docs", (_req, res) => {
  res.type("html").send(renderSwaggerHtml());
});

docsRouter.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

export default docsRouter;
