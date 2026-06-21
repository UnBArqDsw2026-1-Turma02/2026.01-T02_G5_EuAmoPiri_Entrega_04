import type { Request, Response, NextFunction } from "express";
import type { AccountType } from "../../generated/prisma/client.ts";

export function requireAccountType(...allowed: AccountType[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ error: "Não autenticado" });
            return;
        }
        if (!req.user.accountType || !allowed.includes(req.user.accountType)) {
            res.status(403).json({
                error: "Acesso negado para este tipo de conta",
                code: "FORBIDDEN_ACCOUNT_TYPE",
            });
            return;
        }
        next();
    };
}

export const requireMorador = requireAccountType("MORADOR");
export const requireTurista = requireAccountType("TURISTA");
export const requireAdmin = requireAccountType("ADMIN");
export const requireTuristaOrAdmin = requireAccountType("TURISTA", "ADMIN");
