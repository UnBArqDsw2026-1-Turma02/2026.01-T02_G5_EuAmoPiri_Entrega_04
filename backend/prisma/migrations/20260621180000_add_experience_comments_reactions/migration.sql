-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('HEART', 'LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "ExperienceComment" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceReaction" (
    "id" SERIAL NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceReaction_experienceId_userId_key" ON "ExperienceReaction"("experienceId", "userId");

-- AddForeignKey
ALTER TABLE "ExperienceComment" ADD CONSTRAINT "ExperienceComment_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceComment" ADD CONSTRAINT "ExperienceComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceReaction" ADD CONSTRAINT "ExperienceReaction_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceReaction" ADD CONSTRAINT "ExperienceReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
