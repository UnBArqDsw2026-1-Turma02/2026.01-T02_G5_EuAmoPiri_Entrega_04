import prisma from "../config/prisma.ts";
import type { ReportReason } from "../../generated/prisma/client.ts";

export async function createCommentReport(
    commentId: number,
    reporterId: number,
    reason: ReportReason,
    description?: string
) {
    return prisma.experienceCommentReport.create({
        data: {
            commentId,
            reporterId,
            reason,
            description,
        },
    });
}

export async function countCommentReports(commentId: number) {
    return prisma.experienceCommentReport.count({ where: { commentId } });
}

export async function findCommentReportByReporter(commentId: number, reporterId: number) {
    return prisma.experienceCommentReport.findUnique({
        where: { commentId_reporterId: { commentId, reporterId } },
    });
}
