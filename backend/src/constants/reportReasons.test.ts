import { describe, it, expect } from "vitest";
import { isValidReportReason, REPORT_REASONS } from "../constants/reportReasons.ts";

describe("reportReasons", () => {
    it("aceita motivos válidos", () => {
        for (const r of REPORT_REASONS) {
            expect(isValidReportReason(r)).toBe(true);
        }
    });

    it("rejeita motivo inválido", () => {
        expect(isValidReportReason("OFENSIVO")).toBe(false);
    });
});
