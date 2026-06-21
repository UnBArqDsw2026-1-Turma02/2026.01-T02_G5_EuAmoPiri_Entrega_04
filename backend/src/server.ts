import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import passport from "./config/passport.ts";
import { getSwaggerSpec } from "./config/swagger.ts";
import placeRoutes from "./routes/placeRoutes.ts";
import experienceRoutes from "./routes/experienceRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import { syncGooglePlacesToDatabase } from "./services/googlePlacesSyncService.ts";

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

function resolvePublicBaseUrl(req: Request): string {
    const fromEnv =
        process.env.API_URL?.replace(/\/$/, "") ||
        process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "");
    if (fromEnv) return fromEnv;

    const protocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
    const host = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
    return `${protocol}://${host}`;
}

const allowedOrigins = [
    CORS_ORIGIN,
    process.env.API_URL?.replace(/\/$/, ""),
    process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, ""),
].filter((origin): origin is string => Boolean(origin));

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(passport.initialize());

app.use("/api-docs", swaggerUi.serve, (req: Request, res: Response, next: NextFunction) => {
    const baseUrl = resolvePublicBaseUrl(req);
    swaggerUi.setup(getSwaggerSpec(baseUrl))(req, res, next);
});

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Bem-vindo À API do Eu Amo Piri!",
        docs: "/api-docs",
    });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/places", placeRoutes);
app.use("/places", experienceRoutes);

const server = app.listen(Number(PORT), '0.0.0.0');

server.on("listening", () => {
    const publicUrl =
        process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "") ||
        process.env.API_URL?.replace(/\/$/, "");
    console.log(`Servidor rodando na porta ${PORT}`);
    if (publicUrl) {
        console.log(`URL pública: ${publicUrl}`);
        console.log(`Swagger: ${publicUrl}/api-docs`);
    } else {
        console.log(`Swagger: http://localhost:${PORT}/api-docs`);
    }

    syncGooglePlacesToDatabase().catch((err: Error) => {
        console.error("Falha ao sincronizar Google Places:", err.message ?? err);
    });
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
