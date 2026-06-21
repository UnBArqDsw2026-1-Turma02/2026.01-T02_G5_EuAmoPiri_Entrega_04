import type { ReportReason } from "../../generated/prisma/client.ts";
import prisma from "../config/prisma.ts";

const VALID_REASONS: ReportReason[] = ["ODIO", "FALSO", "SENSIVEL", "OUTRO"];

export function isValidReportReason(value: string): value is ReportReason {
    return VALID_REASONS.includes(value as ReportReason);
}

export { VALID_REASONS as REPORT_REASONS };
