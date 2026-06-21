-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('ACTIVE', 'REPORTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('ODIO', 'FALSO', 'SENSIVEL', 'OUTRO');

-- AlterTable
ALTER TABLE "Experiences" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ExperienceComment" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "ExperienceReport" (
    "id" SERIAL NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceCommentReport" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceCommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceReport_experienceId_reporterId_key" ON "ExperienceReport"("experienceId", "reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceCommentReport_commentId_reporterId_key" ON "ExperienceCommentReport"("commentId", "reporterId");

-- AddForeignKey
ALTER TABLE "ExperienceReport" ADD CONSTRAINT "ExperienceReport_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceReport" ADD CONSTRAINT "ExperienceReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceCommentReport" ADD CONSTRAINT "ExperienceCommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "ExperienceComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceCommentReport" ADD CONSTRAINT "ExperienceCommentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
