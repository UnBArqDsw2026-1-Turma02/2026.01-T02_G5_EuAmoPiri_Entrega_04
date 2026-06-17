import type { Request, Response, NextFunction } from "express";
import passport from "../config/passport.ts";

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
