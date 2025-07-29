-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- CreateEnum
CREATE TYPE "ProjectPermission" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "IdFieldType" AS ENUM ('UUID', 'AUTOINCREMENT');

-- CreateEnum
CREATE TYPE "SchemaFieldType" AS ENUM ('ID', 'FAKER', 'STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'OBJECT', 'ARRAY', 'DATE');

-- CreateEnum
CREATE TYPE "FakerType" AS ENUM ('FIRST_NAME', 'LAST_NAME', 'FULL_NAME', 'JOB_TITLE', 'PHONE_NUMBER', 'EMAIL', 'USER_NAME', 'PASSWORD', 'URL', 'IP_ADDRESS', 'CITY', 'COUNTRY', 'STATE', 'STREET_ADDRESS', 'ZIP_CODE', 'LATITUDE', 'LONGITUDE', 'COMPANY_NAME', 'DEPARTMENT', 'PRODUCT_NAME', 'PRICE', 'PAST_DATE', 'FUTURE_DATE', 'RECENT_DATE', 'CREDIT_CARD_NUMBER', 'ACCOUNT_NUMBER', 'AMOUNT', 'CURRENCY', 'WORD', 'SENTENCE', 'PARAGRAPH', 'FILE_NAME', 'DIRECTORY_PATH', 'MIME_TYPE', 'UUID', 'DATABASE_ID');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permission" "ProjectPermission" NOT NULL DEFAULT 'PUBLIC',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endpoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "method" "HttpMethod" NOT NULL DEFAULT 'GET',
    "path" TEXT NOT NULL,
    "staticResponse" JSONB,
    "schemaId" INTEGER,
    "responseWrapperId" INTEGER,
    "isDataList" BOOLEAN NOT NULL DEFAULT false,
    "numberOfData" INTEGER,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schema" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaField" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SchemaFieldType" NOT NULL,
    "idFieldType" "IdFieldType",
    "fakerType" "FakerType",
    "schemaId" INTEGER,
    "objectSchemaId" INTEGER,
    "arrayTypeId" INTEGER,

    CONSTRAINT "SchemaField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrayType" (
    "id" SERIAL NOT NULL,
    "elementType" "SchemaFieldType" NOT NULL,
    "objectSchemaId" INTEGER,
    "fakerType" "FakerType",

    CONSTRAINT "ArrayType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponseWrapper" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "json" JSONB NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponseWrapper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification"("identifier", "value");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_responseWrapperId_fkey" FOREIGN KEY ("responseWrapperId") REFERENCES "ResponseWrapper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaField" ADD CONSTRAINT "SchemaField_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaField" ADD CONSTRAINT "SchemaField_objectSchemaId_fkey" FOREIGN KEY ("objectSchemaId") REFERENCES "Schema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaField" ADD CONSTRAINT "SchemaField_arrayTypeId_fkey" FOREIGN KEY ("arrayTypeId") REFERENCES "ArrayType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrayType" ADD CONSTRAINT "ArrayType_objectSchemaId_fkey" FOREIGN KEY ("objectSchemaId") REFERENCES "Schema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseWrapper" ADD CONSTRAINT "ResponseWrapper_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
