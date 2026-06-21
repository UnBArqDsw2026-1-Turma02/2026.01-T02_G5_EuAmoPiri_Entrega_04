import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import passport from "./config/passport.ts";
import { swaggerSpec } from "./config/swagger.ts";
import placeRoutes from "./routes/placeRoutes.ts";
import experienceRoutes from "./routes/experienceRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Bem-vindo À API do Eu Amo Piri!",
        docs: "/api-docs",
    });
});

app.use("/auth", authRoutes);
app.use("/places", placeRoutes);
app.use("/places", experienceRoutes);

const server = app.listen(Number(PORT), '0.0.0.0');

server.on("listening", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
        console.error(
            `Erro: a porta ${PORT} já está em uso. ` +
            "Encerre o processo anterior (outro terminal com npm run dev) e tente novamente."
        );
        process.exit(1);
    }
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
});
