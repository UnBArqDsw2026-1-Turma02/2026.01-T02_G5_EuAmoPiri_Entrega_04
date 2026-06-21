-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('CACHOEIRA', 'RESTAURANTE', 'POUSADA');

-- Experiences: add nullable columns, backfill, then enforce NOT NULL
ALTER TABLE "Experiences" ADD COLUMN "text" TEXT;
ALTER TABLE "Experiences" ADD COLUMN "title" TEXT;
ALTER TABLE "Experiences" ADD COLUMN "visitDate" TIMESTAMP(3);

UPDATE "Experiences"
SET
  "text" = COALESCE("text", 'Relato migrado'),
  "visitDate" = COALESCE("visitDate", "createdAt")
WHERE "text" IS NULL OR "visitDate" IS NULL;

ALTER TABLE "Experiences" ALTER COLUMN "text" SET NOT NULL;
ALTER TABLE "Experiences" ALTER COLUMN "visitDate" SET NOT NULL;

-- Place: add nullable columns first
ALTER TABLE "Place" ADD COLUMN "address" TEXT;
ALTER TABLE "Place" ADD COLUMN "mapsLink" TEXT;
ALTER TABLE "Place" ADD COLUMN "moradorId" INTEGER;
ALTER TABLE "Place" ADD COLUMN "openingDate" TIMESTAMP(3);
ALTER TABLE "Place" ADD COLUMN "phone" TEXT;
ALTER TABLE "Place" ADD COLUMN "category_new" "PlaceCategory";

-- Backfill existing places
UPDATE "Place"
SET
  "address" = COALESCE("address", 'Endereço não informado'),
  "moradorId" = COALESCE(
    "moradorId",
    (SELECT "id" FROM "User" WHERE "accountType" = 'MORADOR' ORDER BY "id" LIMIT 1),
    (SELECT "id" FROM "User" ORDER BY "id" LIMIT 1)
  ),
  "category_new" = CASE
    WHEN LOWER("category") IN ('cachoeira', 'natureza') THEN 'CACHOEIRA'::"PlaceCategory"
    WHEN LOWER("category") IN ('restaurante', 'gastronomia') THEN 'RESTAURANTE'::"PlaceCategory"
    WHEN LOWER("category") IN ('pousada', 'hospedagem') THEN 'POUSADA'::"PlaceCategory"
    ELSE 'RESTAURANTE'::"PlaceCategory"
  END;

ALTER TABLE "Place" DROP COLUMN "category";
ALTER TABLE "Place" RENAME COLUMN "category_new" TO "category";

ALTER TABLE "Place" ALTER COLUMN "address" SET NOT NULL;
ALTER TABLE "Place" ALTER COLUMN "moradorId" SET NOT NULL;
ALTER TABLE "Place" ALTER COLUMN "category" SET NOT NULL;

-- Photo tables
CREATE TABLE "PlacePhoto" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "PlacePhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExperiencePhoto" (
    "id" SERIAL NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "ExperiencePhoto_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Place" ADD CONSTRAINT "Place_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlacePhoto" ADD CONSTRAINT "PlacePhoto_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExperiencePhoto" ADD CONSTRAINT "ExperiencePhoto_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
