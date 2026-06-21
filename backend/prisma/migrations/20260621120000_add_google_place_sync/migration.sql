-- CreateEnum
CREATE TYPE "PlaceSource" AS ENUM ('COMMUNITY', 'GOOGLE');

-- AlterTable
ALTER TABLE "Place" ADD COLUMN "source" "PlaceSource" NOT NULL DEFAULT 'COMMUNITY';
ALTER TABLE "Place" ADD COLUMN "googlePlaceId" TEXT;
ALTER TABLE "Place" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Place" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Place" ADD COLUMN "externalPhotoUrl" TEXT;
ALTER TABLE "Place" ADD COLUMN "googleRating" DOUBLE PRECISION;
ALTER TABLE "Place" ADD COLUMN "googleReviewCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Place" ALTER COLUMN "moradorId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Place_googlePlaceId_key" ON "Place"("googlePlaceId");

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_moradorId_fkey";

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
