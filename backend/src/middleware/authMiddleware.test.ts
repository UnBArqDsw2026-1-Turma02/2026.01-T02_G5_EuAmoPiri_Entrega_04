import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { authMiddlewareAllowDeletedUser } from "./authMiddleware.ts";
import * as userModel from "../model/userModel.ts";
import { verifyToken } from "../utils/jwt.ts";

vi.mock("../model/userModel.ts", () => ({
    findById: vi.fn(),
}));

vi.mock("../utils/jwt.ts", () => ({
    verifyToken: vi.fn(),
}));

function mockRes() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    return res;
}

describe("authMiddlewareAllowDeletedUser", () => {
    let next: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
        next = vi.fn() as unknown as NextFunction;
    });

    it("retorna 401 sem header Bearer", async () => {
        const req = { headers: {} } as Request;
        const res = mockRes();

        await authMiddlewareAllowDeletedUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("retorna 401 com token inválido", async () => {
        vi.mocked(verifyToken).mockImplementation(() => {
            throw new Error("invalid");
        });
        const req = { headers: { authorization: "Bearer bad-token" } } as Request;
        const res = mockRes();

        await authMiddlewareAllowDeletedUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("popula req.user quando conta existe", async () => {
        vi.mocked(verifyToken).mockReturnValue({ sub: 5, email: "a@test.com" });
        vi.mocked(userModel.findById).mockResolvedValue({
            id: 5,
            email: "a@test.com",
            accountType: "TURISTA",
            name: "Ana",
            birthDate: null,
            phone: null,
            profession: null,
            biography: null,
            profilePhotoUrl: null,
            passwordHash: null,
            createdAt: new Date(),
        });

        const req = { headers: { authorization: "Bearer valid-token" } } as Request;
        const res = mockRes();

        await authMiddlewareAllowDeletedUser(req, res, next);

        expect(req.user?.id).toBe(5);
        expect(req.user?.accountType).toBe("TURISTA");
        expect(next).toHaveBeenCalled();
    });

    it("permite seguir com token válido mesmo se conta foi excluída", async () => {
        vi.mocked(verifyToken).mockReturnValue({ sub: 5, email: "a@test.com" });
        vi.mocked(userModel.findById).mockResolvedValue(null);

        const req = { headers: { authorization: "Bearer valid-token" } } as Request;
        const res = mockRes();

        await authMiddlewareAllowDeletedUser(req, res, next);

        expect(req.user?.id).toBe(5);
        expect(req.user?.accountType).toBeNull();
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
