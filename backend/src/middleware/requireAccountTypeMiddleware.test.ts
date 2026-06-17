import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireAccountType, requireMorador, requireTurista } from "./requireAccountTypeMiddleware.ts";

function mockRes() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    return res;
}

describe("requireAccountTypeMiddleware", () => {
    let next: NextFunction;

    beforeEach(() => {
        next = vi.fn();
    });

    it("retorna 401 sem usuário", () => {
        const req = { user: undefined } as Request;
        const res = mockRes();
        requireMorador(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("retorna 403 para MORADOR em rota TURISTA", () => {
        const req = { user: { accountType: "MORADOR" } } as Request;
        const res = mockRes();
        requireTurista(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ code: "FORBIDDEN_ACCOUNT_TYPE" })
        );
    });

    it("retorna 403 para TURISTA em rota MORADOR", () => {
        const req = { user: { accountType: "TURISTA" } } as Request;
        const res = mockRes();
        requireMorador(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("chama next quando papel correto", () => {
        const req = { user: { accountType: "MORADOR" } } as Request;
        const res = mockRes();
        requireMorador(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("requireAccountType aceita múltiplos papéis", () => {
        const middleware = requireAccountType("MORADOR", "TURISTA");
        const req = { user: { accountType: "TURISTA" } } as Request;
        const res = mockRes();
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
