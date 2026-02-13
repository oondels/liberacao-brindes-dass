import express, { NextFunction, Request, Response } from "express";
import apiRouter from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors"
import { AppDataSource } from "./config/db";
import { config } from "./config/dotenv"
import { CustomError } from "./types/CustomError";

const bootstrap = async () => {
  await AppDataSource.initialize()

  const app = express();
  app.use(cors({ origin: ["http://localhost:5173"], credentials: true }))
  app.use(express.json());
  app.use(cookieParser());

  const port = config.port;

  app.get("/", (req: Request, res: Response) => res.send("App liberacao de brindes esta rodando!"));

  app.use("/api", apiRouter);

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {

  const statusCode = error instanceof CustomError ? error.statusCode : 500;
  const message = error.message || "Erro interno no servidor.";
  const details = error.details || null;

  console.error(`Erro no método ${req.method} em ${req.originalUrl} - ${message}`);
  if (details) {
    console.error("Detalhes do erro: ", details);
  }

  res.status(statusCode).json({
    message: message + " Contate a equipe de automação!",
    ...(process.env.DEV_ENV === "development" && details && { details }),
  });
  return;
});

  app.listen(port, () => console.log(`Application is running at http://localhost:${port}`));
}

bootstrap().catch(error => {
  console.error("Erro ao inicializar aplicação: ", error);
})
