import prisma from "../config/prisma.ts";
import type { ReportReason } from "../../generated/prisma/client.ts";

export async function createExperienceReport(
    experienceId: number,
    reporterId: number,
    reason: ReportReason,
    description?: string
) {
    return prisma.experienceReport.create({
        data: {
            experienceId,
            reporterId,
            reason,
            description,
        },
    });
}

export async function countExperienceReports(experienceId: number) {
    return prisma.experienceReport.count({ where: { experienceId } });
}

export async function findExperienceReportByReporter(experienceId: number, reporterId: number) {
    return prisma.experienceReport.findUnique({
        where: { experienceId_reporterId: { experienceId, reporterId } },
    });
}
