import type { Request, Response, NextFunction } from "express";
import passport from "../config/passport.ts";
import * as userModel from "../model/userModel.ts";
import { verifyToken } from "../utils/jwt.ts";
import { formatUser } from "../views/userView.ts";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", { session: false }, (err: Error | null, user: Express.User | false) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: "Não autenticado" });
        }
        req.user = user;
        return next();
    })(req, res, next);
}

function buildUserFromTokenPayload(payload: { sub: number; email: string }): Express.User {
    return {
        id: payload.sub,
        email: payload.email,
        accountType: null,
        name: "",
        birthDate: null,
        phone: null,
        profession: null,
        biography: null,
        profilePhotoUrl: null,
        createdAt: new Date(0),
    };
}

/**
 * Autentica via JWT e permite seguir mesmo se a conta foi excluída do banco
 * (token ainda válido). Necessário para retornar 404 em re-exclusão, em vez de 401.
 */
export async function authMiddlewareAllowDeletedUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }

    try {
        const payload = verifyToken(authHeader.slice(7));
        const user = await userModel.findById(payload.sub);
        req.user = user ? formatUser(user) : buildUserFromTokenPayload(payload);
        next();
    } catch {
        res.status(401).json({ error: "Não autenticado" });
    }
}
