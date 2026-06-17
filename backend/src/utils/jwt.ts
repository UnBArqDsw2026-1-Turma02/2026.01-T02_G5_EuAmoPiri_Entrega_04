import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export interface AppJwtPayload {
    sub: number;
    email: string;
}

export function signToken(userId: number, email: string): string {
    return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AppJwtPayload {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
        throw new Error("Invalid token payload");
    }
    const payload = decoded as Record<string, unknown>;
    if (typeof payload.sub !== "number" || typeof payload.email !== "string") {
        throw new Error("Invalid token payload");
    }
    return { sub: payload.sub, email: payload.email };
}
