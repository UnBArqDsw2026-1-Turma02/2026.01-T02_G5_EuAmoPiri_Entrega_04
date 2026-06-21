-- Remove reações dislike e enum DISLIKE
DELETE FROM "ExperienceReaction" WHERE "type" = 'DISLIKE';

CREATE TYPE "ReactionType_new" AS ENUM ('HEART', 'LIKE');

ALTER TABLE "ExperienceReaction"
  ALTER COLUMN "type" TYPE "ReactionType_new"
  USING ("type"::text::"ReactionType_new");

DROP TYPE "ReactionType";

ALTER TYPE "ReactionType_new" RENAME TO "ReactionType";
