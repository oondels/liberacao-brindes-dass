import express, { Request, Response } from "express";
import apiRouter from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors"
import { AppDataSource } from "./config/db";

const bootstrap = async () => {
  await AppDataSource.initialize()

  const app = express();
  app.use(cors({ origin: ["http://localhost:5173"], credentials: true }))
  app.use(express.json());
  app.use(cookieParser());

  const port = 2307;

  app.get("/", (req: Request, res: Response) => res.send("App liberacao de brindes esta rodando!"));

  app.use("/api", apiRouter);

  app.listen(port, () => console.log(`Application is running at http://localhost:${port}`));
}

bootstrap().catch(error => {
  console.error("Erro ao inicializar aplicação: ", error);
})
