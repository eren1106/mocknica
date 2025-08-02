/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "isNeedToken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_token_key" ON "public"."Project"("token");
