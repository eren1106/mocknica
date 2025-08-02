-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "corsOrigins" TEXT[] DEFAULT ARRAY[]::TEXT[];
