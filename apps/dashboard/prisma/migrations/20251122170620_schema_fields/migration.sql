/*
  Warnings:

  - You are about to drop the column `name` on the `Endpoint` table. All the data in the column will be lost.
  - You are about to drop the `ArrayType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SchemaField` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `description` on table `Endpoint` required. This step will fail if there are existing NULL values in that column.
  - Made the column `staticResponse` on table `Endpoint` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ArrayType" DROP CONSTRAINT "ArrayType_objectSchemaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SchemaField" DROP CONSTRAINT "SchemaField_arrayTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SchemaField" DROP CONSTRAINT "SchemaField_objectSchemaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SchemaField" DROP CONSTRAINT "SchemaField_schemaId_fkey";

-- AlterTable
ALTER TABLE "public"."Endpoint" DROP COLUMN "name",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "staticResponse" SET NOT NULL,
ALTER COLUMN "isDataList" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."ArrayType";

-- DropTable
DROP TABLE "public"."SchemaField";

-- DropEnum
DROP TYPE "public"."FakerType";

-- DropEnum
DROP TYPE "public"."IdFieldType";

-- DropEnum
DROP TYPE "public"."SchemaFieldType";
