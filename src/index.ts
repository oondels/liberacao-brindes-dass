import express, {Request, Response} from "express";
import apiRouter from "./routes/index";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

const port = 2307;

app.get("/", (req: Request, res: Response) => res.send("App liberacao de brindes esta rodando!"));

app.use("/api", apiRouter);

app.listen(port, () => console.log(`Application is running at http://localhost:${port}`));
